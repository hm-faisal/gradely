import { z } from "zod";

export const assignReviewerSchema = z.object({
	submissionId: z
		.string()
		.trim()
		.min(1, { error: "Submission id is required" }),
	reviewerId: z.string().trim().min(1, { error: "Choose a reviewer" }),
});
