export type PaginationQuery = {
	offset: number;
	limit: number;
};

export type PaginationMeta = {
	offset: number;
	limit: number;
	total: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export const getPagination = ({ offset, limit }: PaginationQuery) => ({
	limit,
	offset,
});

export const createPaginationMeta = (
	{ offset, limit }: PaginationQuery,
	total: number,
): PaginationMeta => {
	return {
		offset,
		limit,
		total,
		hasNextPage: offset + limit < total,
		hasPreviousPage: offset > 0,
	};
};
