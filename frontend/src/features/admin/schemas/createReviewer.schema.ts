import { z } from "zod";

export const createReviewerSchema = z.object({
	name: z
		.string({ error: "Name must be a string" })
		.trim()
		.min(2, { error: "Name must be at least 2 characters" })
		.max(255, { error: "Name must be at most 255 characters" }),
	email: z
		.email({ error: "Please provide a valid email address" })
		.trim()
		.toLowerCase()
		.max(254, { error: "Email must be at most 254 characters" }),
	password: z
		.string({ error: "Password must be a string" })
		.min(8, { error: "Password must be at least 8 characters" })
		.max(128, { error: "Password must be at most 128 characters" })
		.regex(/[a-z]/, {
			error: "Password must contain at least one lowercase letter",
		})
		.regex(/[A-Z]/, {
			error: "Password must contain at least one uppercase letter",
		})
		.regex(/\d/, { error: "Password must contain at least one number" })
		.regex(/[^A-Za-z0-9\s]/, {
			error: "Password must contain at least one special character",
		})
		.refine((value) => !/\s/.test(value), {
			error: "Password must not contain spaces",
		}),
});
