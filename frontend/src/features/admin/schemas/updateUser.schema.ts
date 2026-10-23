import { z } from "zod";
import { EDITABLE_USER_STATUSES } from "../types";
import { createReviewerSchema } from "./createReviewer.schema";

export const updateUserSchema = z.object({
	userId: z.string().trim().min(1, { error: "User id is required" }),
	name: createReviewerSchema.shape.name,
	email: createReviewerSchema.shape.email,
	role: z
		.enum(["STUDENT", "ADMIN", "REVIEWER"], {
			error: "Choose a valid role",
		})
		.optional(),
	status: z
		.enum(EDITABLE_USER_STATUSES, {
			error: "Choose a valid status",
		})
		.optional(),
});
