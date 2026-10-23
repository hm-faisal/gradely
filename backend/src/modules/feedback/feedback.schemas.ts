import { z } from "zod";
import { createPaginationSchema } from "../../schemas/pagination.schema";
import { createStringSchema } from "../../schemas/string.schema";

const feedbackContentSchema = createStringSchema({
	min: 3,
	max: 2000,
	field: "Feedback",
});

export const updateFeedbackSchema = z.object({
	content: feedbackContentSchema,
});

export const listFeedbacksQuerySchema = createPaginationSchema(20).extend({
	reviewerId: z.string().trim().min(1).optional(),
	submissionId: z.string().trim().min(1).optional(),
});

export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
export type ListFeedbacksQuery = z.infer<typeof listFeedbacksQuerySchema>;
