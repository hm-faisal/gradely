import { z } from "zod";
import { sanitizeString } from "../utils/sanitize.ts";

export type StringSchemaOptions = {
	min?: number;
	max?: number;
	field?: string;
};

const pluralize = (count: number, word: string) =>
	`${count} ${word}${count === 1 ? "" : "s"}`;

/**
 * Creates a trimmed, sanitized string schema with configurable length limits.
 */
export const createStringSchema = ({
	min = 1,
	max = 255,
	field = "Value",
}: StringSchemaOptions = {}) => {
	const label = field.trim() || "Value";

	return z
		.string({ error: `${label} must be a string` })
		.transform((value) => sanitizeString(value))
		.pipe(
			z
				.string()
				.min(min, {
					error: `${label} must be at least ${pluralize(min, "character")}`,
				})
				.max(max, {
					error: `${label} must be at most ${pluralize(max, "character")}`,
				}),
		);
};

/** Default required string: sanitized, trimmed, 1-255 characters. */
export const stringSchema = createStringSchema();

/** A person's name: sanitized, trimmed, 2-255 characters. */
export const nameSchema = createStringSchema({
	min: 2,
	max: 255,
	field: "Name",
});

/** Optional string that converts blank input to `undefined`. */
export const optionalStringSchema = z
	.string()
	.optional()
	.transform((value) => {
		const sanitized = value === undefined ? "" : sanitizeString(value);
		return sanitized.length > 0 ? sanitized : undefined;
	});
