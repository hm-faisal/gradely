import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const passwordSchema = z
	.string({ error: "Password must be a string" })
	.min(PASSWORD_MIN_LENGTH, {
		error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
	})
	.max(PASSWORD_MAX_LENGTH, {
		error: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
	})
	.regex(/[a-z]/, {
		error: "Password must contain at least one lowercase letter",
	})
	.regex(/[A-Z]/, {
		error: "Password must contain at least one uppercase letter",
	})
	.regex(/\d/, {
		error: "Password must contain at least one number",
	})
	.regex(/[^A-Za-z0-9\s]/, {
		error: "Password must contain at least one special character",
	})
	.refine((value) => !/\s/.test(value), {
		error: "Password must not contain spaces",
	});

export const passwordsMatch = <
	T extends { password: string; confirmPassword: string },
>(
	data: T,
	ctx: z.RefinementCtx,
) => {
	if (data.password !== data.confirmPassword) {
		ctx.addIssue({
			code: "custom",
			message: "Passwords do not match",
			path: ["confirmPassword"],
		});
	}
};
