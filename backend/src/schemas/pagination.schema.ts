import { z } from "zod";

export const MAX_PAGE_SIZE = 100;

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

export const booleanQuerySchema = z
	.enum(["true", "false"], { error: "Must be either true or false" })
	.transform((value) => value === "true");
