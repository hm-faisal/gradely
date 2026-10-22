import { z } from "zod";
import { EMAIL_MAX_LENGTH } from "../constants/auth.constants";
import { validateWith } from "./utils";

/**
 * Normalized email schema: trimmed, validated, then lowercased so the same
 * address always maps to the same value. Mirrors `backend/src/schemas`.
 */
export const emailSchema = z
	.string({ error: "Email is required" })
	.trim()
	.min(1, { error: "Email is required" })
	.max(EMAIL_MAX_LENGTH, {
		error: `Email must be at most ${EMAIL_MAX_LENGTH} characters`,
	})
	.pipe(z.email({ error: "Please provide a valid email address" }))
	.transform((value) => value.toLowerCase());

export function validateEmail(value: string): string | undefined {
	return validateWith(emailSchema, value);
}
