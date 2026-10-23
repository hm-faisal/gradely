import { z } from "zod";

/** Maximum number of records a single API page may return. */
export const MAX_PAGE_SIZE = 100;

/**
 * Creates the standard `page` / `limit` query schema. Modules can pass their
 * own default page size while keeping validation and limits consistent.
 */
export const createPaginationSchema = (defaultLimit = 10) =>
	z.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce
			.number()
			.int()
			.min(1)
			.max(MAX_PAGE_SIZE)
			.default(defaultLimit),
	});

/**
 * Coerces the string booleans sent in query strings ("true" / "false") into
 * real booleans without the `z.coerce.boolean()` caveat where any non-empty
 * string becomes `true`.
 */
export const booleanQuerySchema = z
	.enum(["true", "false"], { error: "Must be either true or false" })
	.transform((value) => value === "true");
