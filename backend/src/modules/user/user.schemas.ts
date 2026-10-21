import { z } from "zod";
import { emailSchema } from "../../schemas/email.schema";
import { nameSchema } from "../../schemas/string.schema";

export const updateUserSchema = z
	.object({
		name: nameSchema.optional(),
		email: emailSchema.optional(),
	})
	.refine((data) => data.name !== undefined || data.email !== undefined, {
		error: "At least one field must be provided",
	});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
