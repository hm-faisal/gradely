import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import { db } from "../../prisma/db";
import type { AccessTokenPayload } from "../../utils/jwt";
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

const isAdmin = (user: AccessTokenPayload) => user.role === "ADMIN";

const findSubmissionById = async (id: string) =>
	db.orm.public.Submission.where({ id })
		.select(...submissionFields)
		.include("student", (student) => student.select(...userSummaryFields))
		.include("reviewer", (reviewer) => reviewer.select(...userSummaryFields))
		.first();

const assertCanAccess = (
	submission: { studentId: string },
	user: AccessTokenPayload,
) => {
	if (!isAdmin(user) && submission.studentId !== user.id) {
		throw new ForbiddenError("You do not have access to this submission");
	}
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
	status?: "PENDING" | "APPROVED" | "REJECTED";
};

type SubmissionPagination = {
	page: number;
	limit: number;
};

const paginateSubmissions = async (
	filters: SubmissionFilters,
	query: SubmissionPagination,
) => {
	const baseCollection = db.orm.public.Submission;
	const collection =
		Object.keys(filters).length > 0
			? baseCollection.where(filters)
			: baseCollection;

	const { total } = await collection.aggregate((aggregate) => ({
		total: aggregate.count(),
	}));

	const items = await collection
		.select(...submissionFields)
		.include("student", (student) => student.select(...userSummaryFields))
		.include("reviewer", (reviewer) => reviewer.select(...userSummaryFields))
		.orderBy((submission) => submission.createdAt.desc())
		.limit(query.limit)
		.offset((query.page - 1) * query.limit)
		.all();

	return {
		items,
		meta: {
			page: query.page,
			limit: query.limit,
			total,
			totalPages: Math.ceil(total / query.limit),
		},
	};
};

const listSubmissions = async (
	user: AccessTokenPayload,
	query: ListSubmissionsQuery,
) => {
	const filters: SubmissionFilters = {};

	if (isAdmin(user)) {
		if (query.studentId) {
			filters.studentId = query.studentId;
		}
	} else {
		if (query.studentId && query.studentId !== user.id) {
			throw new ForbiddenError("You can only view your own submissions");
		}

		filters.studentId = user.id;
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

	if (existing.studentId !== user.id) {
		throw new ForbiddenError("You can only update your own submissions");
	}

	if (existing.status !== SubmissionStatus.members.PENDING) {
		throw new BadRequestError("Only pending submissions can be updated");
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
		.select("id", "status")
		.first();

	if (!existing) {
		throw new NotFoundError("Submission not found");
	}

	if (existing.status !== SubmissionStatus.members.PENDING) {
		throw new BadRequestError("Only pending submissions can be reviewed");
	}

	await db.orm.public.Submission.where({ id }).update({
		status: payload.status,
		feedback: payload.feedback ?? null,
		reviewerId: reviewer.id,
		reviewedAt: new Date().toISOString(),
	});

	const submission = await findSubmissionById(id);

	if (!submission) {
		throw new NotFoundError("Submission not found");
	}

	return submission;
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
	deleteSubmission,
};
