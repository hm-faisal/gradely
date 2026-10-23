import { z } from "zod";

export const EMAIL_MAX_LENGTH = 254;

export const emailSchema = z
	.email({ error: "Please provide a valid email address" })
	.trim()
	.toLowerCase()
	.min(1, { error: "Email is required" })
	.max(EMAIL_MAX_LENGTH, {
		error: `Email must be at most ${EMAIL_MAX_LENGTH} characters`,
	});
