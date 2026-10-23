import { z } from "zod";

export const updateFeedbackSchema = z.object({
	feedbackId: z.string().trim().min(1, { error: "Feedback id is required" }),
	content: z
		.string({ error: "Feedback must be a string" })
		.trim()
		.min(3, { error: "Feedback must be at least 3 characters" })
		.max(2000, { error: "Feedback must be at most 2000 characters" }),
});
