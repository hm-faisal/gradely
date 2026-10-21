import { z } from "zod";

/** Maximum email length according to RFC 5321. */
export const EMAIL_MAX_LENGTH = 254;

/**
 * Normalized email schema.
 *
 * Emails are trimmed, lowercased, and validated so the same address always
 * maps to the same database value regardless of how it was typed.
 */
export const emailSchema = z
	.email({ error: "Please provide a valid email address" })
	.trim()
	.toLowerCase()
	.min(1, { error: "Email is required" })
	.max(EMAIL_MAX_LENGTH, {
		error: `Email must be at most ${EMAIL_MAX_LENGTH} characters`,
	});
