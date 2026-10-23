import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import { db } from "../../prisma/db";
import type { AccessTokenPayload } from "../../utils/jwt";
import { createPaginationMeta, getPagination } from "../../utils/pagination";
import type {
	CreateSubmissionInput,
	ListMySubmissionsQuery,
	ListSubmissionsQuery,
	ReviewSubmissionInput,
	UpdateSubmissionInput,
} from "./submission.schemas";

const { SubmissionStatus } = db.enums.public;

const submissionFields = [
	"id",
	"projectName",
	"repoUrl",
	"liveLink",
	"description",
	"status",
	"feedback",
	"studentId",
	"reviewerId",
	"reviewedAt",
	"createdAt",
	"updatedAt",
] as const;

const userSummaryFields = ["id", "name", "email", "role"] as const;

const findSubmissionById = async (id: string) =>
	db.orm.public.Submission.where({ id })
		.select(...submissionFields)
		.include("student", (student) => student.select(...userSummaryFields))
		.include("reviewer", (reviewer) => reviewer.select(...userSummaryFields))
		.first();

const assertCanAccess = (
	submission: { studentId: string; reviewerId: string | null },
	user: AccessTokenPayload,
) => {
	if (user.role === "ADMIN") return;

	if (user.role === "REVIEWER" && submission.reviewerId === user.id) return;

	if (submission.studentId === user.id) return;

	throw new ForbiddenError("You do not have access to this submission");
};

const createSubmission = async (
	user: AccessTokenPayload,
	payload: CreateSubmissionInput,
) => {
	const repositoryOwner = await db.orm.public.Submission.where({
		repoUrl: payload.repoUrl,
	})
		.select("id")
		.first();

	if (repositoryOwner) {
		throw new BadRequestError(
			"A submission with this repository URL already exists",
		);
	}

	const duplicateProject = await db.orm.public.Submission.where({
		studentId: user.id,
		projectName: payload.projectName,
	})
		.select("id")
		.first();

	if (duplicateProject) {
		throw new BadRequestError(
			"You have already submitted a project with this name",
		);
	}

	const created = await db.orm.public.Submission.select("id").create({
		projectName: payload.projectName,
		repoUrl: payload.repoUrl,
		liveLink: payload.liveLink,
		description: payload.description,
		studentId: user.id,
	});

	const submission = await findSubmissionById(created.id);

	if (!submission) {
		throw new NotFoundError("Submission not found");
	}

	return submission;
};

type SubmissionFilters = {
	studentId?: string;
	reviewerId?: string;
	status?: "PENDING" | "APPROVED" | "REJECTED";
};

type SubmissionPagination = {
	page: number;
	limit: number;
	reviewed?: boolean;
	hasFeedback?: boolean;
	unassigned?: boolean;
};

const paginateSubmissions = async (
	filters: SubmissionFilters,
	query: SubmissionPagination,
) => {
	let collection = db.orm.public.Submission.where(filters);

	if (query.reviewed !== undefined) {
		const reviewed = query.reviewed;

		collection = collection.where((submission) =>
			reviewed
				? submission.reviewedAt.isNotNull()
				: submission.reviewedAt.isNull(),
		);
	}

	if (query.hasFeedback !== undefined) {
		const hasFeedback = query.hasFeedback;

		collection = collection.where((submission) =>
			hasFeedback
				? submission.feedback.isNotNull()
				: submission.feedback.isNull(),
		);
	}

	if (query.unassigned !== undefined) {
		const unassigned = query.unassigned;

		collection = collection.where((submission) =>
			unassigned
				? submission.reviewerId.isNull()
				: submission.reviewerId.isNotNull(),
		);
	}

	const { total } = await collection.aggregate((aggregate) => ({
		total: aggregate.count(),
	}));

	const { limit, offset } = getPagination(query);
	const orderByReviewedAt =
		query.reviewed === true || query.hasFeedback === true;

	const items = await collection
		.select(...submissionFields)
		.include("student", (student) => student.select(...userSummaryFields))
		.include("reviewer", (reviewer) => reviewer.select(...userSummaryFields))
		.orderBy((submission) =>
			orderByReviewedAt
				? submission.reviewedAt.desc({ nulls: "last" })
				: submission.createdAt.desc(),
		)
		.limit(limit)
		.offset(offset)
		.all();

	return {
		items,
		meta: createPaginationMeta(query, total),
	};
};

const listSubmissions = async (
	user: AccessTokenPayload,
	query: ListSubmissionsQuery,
) => {
	const filters: SubmissionFilters = {};

	if (user.role === "REVIEWER") {
		filters.reviewerId = user.id;
	} else {
		if (query.studentId) {
			filters.studentId = query.studentId;
		}

		if (query.reviewerId) {
			filters.reviewerId = query.reviewerId;
		}
	}

	if (query.status) {
		filters.status = query.status;
	}

	return paginateSubmissions(filters, query);
};

const listMySubmissions = async (
	user: AccessTokenPayload,
	query: ListMySubmissionsQuery,
) => {
	const filters: SubmissionFilters = {
		studentId: user.id,
	};

	if (query.status) {
		filters.status = query.status;
	}

	return paginateSubmissions(filters, query);
};

const getSubmissionById = async (id: string, user: AccessTokenPayload) => {
	const submission = await findSubmissionById(id);

	if (!submission) {
		throw new NotFoundError("Submission not found");
	}

	assertCanAccess(submission, user);

	return submission;
};

const updateSubmission = async (
	id: string,
	user: AccessTokenPayload,
	payload: UpdateSubmissionInput,
) => {
	const existing = await db.orm.public.Submission.where({ id })
		.select("id", "studentId", "projectName", "repoUrl", "status")
		.first();

	if (!existing) {
		throw new NotFoundError("Submission not found");
	}

	if (user.role !== "ADMIN") {
		if (existing.studentId !== user.id) {
			throw new ForbiddenError("You can only update your own submissions");
		}

		if (existing.status !== SubmissionStatus.members.PENDING) {
			throw new BadRequestError("Only pending submissions can be updated");
		}
	}

	if (payload.repoUrl !== undefined && payload.repoUrl !== existing.repoUrl) {
		const repositoryOwner = await db.orm.public.Submission.where({
			repoUrl: payload.repoUrl,
		})
			.select("id")
			.first();

		if (repositoryOwner && repositoryOwner.id !== id) {
			throw new BadRequestError(
				"A submission with this repository URL already exists",
			);
		}
	}

	if (
		payload.projectName !== undefined &&
		payload.projectName !== existing.projectName
	) {
		const duplicateProject = await db.orm.public.Submission.where({
			studentId: existing.studentId,
			projectName: payload.projectName,
		})
			.select("id")
			.first();

		if (duplicateProject && duplicateProject.id !== id) {
			throw new BadRequestError(
				"You have already submitted a project with this name",
			);
		}
	}

	const updateData = {
		...(payload.projectName !== undefined
			? { projectName: payload.projectName }
			: {}),
		...(payload.repoUrl !== undefined ? { repoUrl: payload.repoUrl } : {}),
		...(payload.liveLink !== undefined ? { liveLink: payload.liveLink } : {}),
		...(payload.description !== undefined
			? { description: payload.description }
			: {}),
	};

	await db.orm.public.Submission.where({ id }).update(updateData);

	const submission = await findSubmissionById(id);

	if (!submission) {
		throw new NotFoundError("Submission not found");
	}

	return submission;
};

const reviewSubmission = async (
	id: string,
	reviewer: AccessTokenPayload,
	payload: ReviewSubmissionInput,
) => {
	const existing = await db.orm.public.Submission.where({ id })
		.select("id", "status", "reviewerId")
		.first();

	if (!existing) {
		throw new NotFoundError("Submission not found");
	}

	if (reviewer.role === "REVIEWER" && existing.reviewerId !== reviewer.id) {
		throw new ForbiddenError("This submission is not assigned to you");
	}

	const isEdit = existing.status !== SubmissionStatus.members.PENDING;
	const feedback = payload.feedback ?? null;
	const reviewedAt = new Date().toISOString();

	const existingFeedback = await db.orm.public.Feedback.where({
		submissionId: id,
	})
		.select("id")
		.first();

	await db.orm.public.Submission.where({ id }).update({
		status: payload.status,
		feedback,
		...(isEdit ? {} : { reviewerId: reviewer.id }),
		reviewedAt,
	});

	if (feedback) {
		if (existingFeedback) {
			await db.orm.public.Feedback.where({ id: existingFeedback.id }).update({
				content: feedback,
			});
		} else {
			await db.orm.public.Feedback.select("id").create({
				content: feedback,
				submissionId: id,
				reviewerId: isEdit ? (existing.reviewerId ?? reviewer.id) : reviewer.id,
			});
		}
	} else if (existingFeedback) {
		await db.orm.public.Feedback.where({ id: existingFeedback.id }).delete();
	}

	const submission = await findSubmissionById(id);

	if (!submission) {
		throw new NotFoundError("Submission not found");
	}

	return submission;
};

const assignReviewer = async (id: string, reviewerId: string) => {
	const submission = await db.orm.public.Submission.where({ id })
		.select("id", "status")
		.first();

	if (!submission) {
		throw new NotFoundError("Submission not found");
	}

	if (submission.status !== SubmissionStatus.members.PENDING) {
		throw new BadRequestError("Only pending submissions can be assigned");
	}

	const reviewer = await db.orm.public.User.where({ id: reviewerId })
		.select("id", "role", "status")
		.first();

	if (!reviewer) {
		throw new NotFoundError("Reviewer not found");
	}

	if (reviewer.role !== "REVIEWER") {
		throw new BadRequestError("Selected user is not a reviewer");
	}

	if (reviewer.status !== "ACTIVE") {
		throw new BadRequestError("Selected reviewer is not active");
	}

	await db.orm.public.Submission.where({ id }).update({ reviewerId });

	const updated = await findSubmissionById(id);

	if (!updated) {
		throw new NotFoundError("Submission not found");
	}

	return updated;
};

const autoAssignReviewers = async () => {
	const reviewers = await db.orm.public.User.where({
		role: "REVIEWER",
		status: "ACTIVE",
	})
		.select("id", "name")
		.all();

	if (reviewers.length === 0) {
		throw new BadRequestError(
			"Add an active reviewer before auto-assigning submissions",
		);
	}

	const pending = await db.orm.public.Submission.where({
		status: SubmissionStatus.members.PENDING,
	})
		.select("id", "reviewerId", "createdAt")
		.orderBy((submission) => submission.createdAt.asc())
		.all();

	const unassigned = pending.filter((submission) => !submission.reviewerId);

	if (unassigned.length === 0) {
		return {
			assigned: 0,
			reviewers: reviewers.length,
			assignments: [] as { submissionId: string; reviewerId: string }[],
		};
	}

	const counts = new Map(reviewers.map((reviewer) => [reviewer.id, 0]));

	for (const submission of pending) {
		if (!submission.reviewerId) continue;

		const current = counts.get(submission.reviewerId);
		if (current !== undefined) {
			counts.set(submission.reviewerId, current + 1);
		}
	}

	const assignments: { submissionId: string; reviewerId: string }[] = [];

	for (const submission of unassigned) {
		const lowestCount = Math.min(
			...reviewers.map((reviewer) => counts.get(reviewer.id) ?? 0),
		);
		const candidates = reviewers.filter(
			(reviewer) => (counts.get(reviewer.id) ?? 0) === lowestCount,
		);
		const selected =
			candidates[Math.floor(Math.random() * candidates.length)] ?? reviewers[0];

		if (!selected) continue;

		await db.orm.public.Submission.where({ id: submission.id }).update({
			reviewerId: selected.id,
		});
		counts.set(selected.id, (counts.get(selected.id) ?? 0) + 1);
		assignments.push({
			submissionId: submission.id,
			reviewerId: selected.id,
		});
	}

	return {
		assigned: assignments.length,
		reviewers: reviewers.length,
		assignments,
	};
};

const deleteSubmission = async (id: string, user: AccessTokenPayload) => {
	const submission = await findSubmissionById(id);

	if (!submission) {
		throw new NotFoundError("Submission not found");
	}

	assertCanAccess(submission, user);

	await db.orm.public.Submission.where({ id }).delete();

	return submission;
};

export const submissionService = {
	createSubmission,
	listSubmissions,
	listMySubmissions,
	getSubmissionById,
	updateSubmission,
	reviewSubmission,
	assignReviewer,
	autoAssignReviewers,
	deleteSubmission,
};
