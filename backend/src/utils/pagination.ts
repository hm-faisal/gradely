export type PaginationQuery = {
	page: number;
	limit: number;
};

export type PaginationMeta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

/**
 * Converts a validated pagination query into database-friendly limit/offset
 * values.
 */
export const getPagination = ({ page, limit }: PaginationQuery) => ({
	limit,
	offset: (page - 1) * limit,
});

/**
 * Builds the pagination metadata attached to every paginated API response.
 */
export const createPaginationMeta = (
	{ page, limit }: PaginationQuery,
	total: number,
): PaginationMeta => {
	const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

	return {
		page,
		limit,
		total,
		totalPages,
		hasNextPage: page < totalPages,
		hasPreviousPage: totalPages > 0 && page > 1,
	};
};
