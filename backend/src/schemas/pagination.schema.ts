import { z } from "zod";

export const MAX_PAGE_SIZE = 100;

export const createPaginationSchema = (defaultLimit = 10) =>
	z.object({
		offset: z.coerce.number().int().min(0).default(0),
		limit: z.coerce
			.number()
			.int()
			.min(1)
			.max(MAX_PAGE_SIZE)
			.default(defaultLimit),
		searchParam: z.string().trim().optional(),
		search: z.string().trim().optional(),
	});

export const booleanQuerySchema = z
	.enum(["true", "false"], { error: "Must be either true or false" })
	.transform((value) => value === "true");
