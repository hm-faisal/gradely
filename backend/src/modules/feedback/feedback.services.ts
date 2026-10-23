import { NotFoundError } from "../../errors";
import { db } from "../../prisma/db";
import { createPaginationMeta, getPagination } from "../../utils/pagination";
import type {
	ListFeedbacksQuery,
	UpdateFeedbackInput,
} from "./feedback.schemas";

const feedbackFields = [
	"id",
	"content",
	"submissionId",
	"reviewerId",
	"createdAt",
	"updatedAt",
] as const;

const userSummaryFields = ["id", "name", "email", "role"] as const;

const submissionSummaryFields = [
	"id",
	"projectName",
	"status",
	"studentId",
	"repoUrl",
	"liveLink",
	"description",
	"createdAt",
	"reviewedAt",
] as const;

const findFeedbackById = async (id: string) =>
	db.orm.public.Feedback.where({ id })
		.select(...feedbackFields)
		.include("reviewer", (reviewer) => reviewer.select(...userSummaryFields))
		.include("submission", (submission) =>
			submission
				.select(...submissionSummaryFields)
				.include("student", (student) => student.select(...userSummaryFields)),
		)
		.first();

type FeedbackFilters = {
	reviewerId?: string;
	submissionId?: string;
};

const listFeedbacks = async (query: ListFeedbacksQuery) => {
	const filters: FeedbackFilters = {};

	if (query.reviewerId) filters.reviewerId = query.reviewerId;
	if (query.submissionId) filters.submissionId = query.submissionId;

	let collection =
		Object.keys(filters).length > 0
			? db.orm.public.Feedback.where(filters)
			: db.orm.public.Feedback;

	const search = (query.searchParam ?? query.search)?.toLowerCase();
	if (search) {
		collection = collection.where((feedback) =>
			feedback.content.ilike(`%${search}%`),
		);
	}

	const { total } = await collection.aggregate((aggregate) => ({
		total: aggregate.count(),
	}));

	const { limit, offset } = getPagination(query);

	const items = await collection
		.select(...feedbackFields)
		.include("reviewer", (reviewer) => reviewer.select(...userSummaryFields))
		.include("submission", (submission) =>
			submission
				.select(...submissionSummaryFields)
				.include("student", (student) => student.select(...userSummaryFields)),
		)
		.orderBy((feedback) => feedback.createdAt.desc())
		.limit(limit)
		.offset(offset)
		.all();

	return {
		items,
		meta: createPaginationMeta(query, total),
	};
};

const getFeedbackById = async (id: string) => {
	const feedback = await findFeedbackById(id);

	if (!feedback) {
		throw new NotFoundError("Feedback not found");
	}

	return feedback;
};

const updateFeedback = async (id: string, payload: UpdateFeedbackInput) => {
	const existing = await db.orm.public.Feedback.where({ id })
		.select("id", "submissionId")
		.first();

	if (!existing) {
		throw new NotFoundError("Feedback not found");
	}

	await db.orm.public.Feedback.where({ id }).update({
		content: payload.content,
	});

	await db.orm.public.Submission.where({ id: existing.submissionId }).update({
		feedback: payload.content,
	});

	return getFeedbackById(id);
};

export const feedbackService = {
	listFeedbacks,
	getFeedbackById,
	updateFeedback,
};
