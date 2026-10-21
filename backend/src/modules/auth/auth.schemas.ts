import { z } from "zod";
import { emailSchema } from "../../schemas/email.schema";
import { passwordSchema } from "../../schemas/password.schema";
import { nameSchema } from "../../schemas/string.schema";

export const registerSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	password: passwordSchema,
});

const currentPasswordSchema = z
	.string({ error: "Password must be a string" })
	.min(1, { error: "Password is required" })
	.max(128, { error: "Password must be at most 128 characters" });

export const loginSchema = z.object({
	email: emailSchema,
	password: currentPasswordSchema,
});

export const changePasswordSchema = z
	.object({
		oldPassword: currentPasswordSchema,
		newPassword: passwordSchema,
	})
	.refine((data) => data.oldPassword !== data.newPassword, {
		error: "New password must be different from the old password",
		path: ["newPassword"],
	});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
