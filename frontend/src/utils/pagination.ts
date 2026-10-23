import { DEFAULT_PAGE_SIZE } from "@/constants/pagination.constants";
import type { PaginatedResult, PaginationMeta } from "@/types/pagination";

export const parseOffsetParam = (value?: string | string[] | null): number => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const offset = Number(rawValue);

  return Number.isInteger(offset) && offset >= 0 ? offset : 0;
};

export const parseLimitParam = (
  value?: string | string[] | null,
  defaultLimit = DEFAULT_PAGE_SIZE,
): number => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const limit = Number(rawValue);

  return Number.isInteger(limit) && limit > 0 && limit <= 100
    ? limit
    : defaultLimit;
};

export const parseSearchParam = (
  value?: string | string[] | null,
): string | undefined => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue?.trim() || undefined;
};

export const createPaginationMeta = (
  offset: number,
  limit: number,
  total = 0,
): PaginationMeta => {
  return {
    offset,
    limit,
    total,
    hasNextPage: offset + limit < total,
    hasPreviousPage: offset > 0,
  };
};

export const emptyPaginatedResult = <T>(
  offset = 0,
  limit = DEFAULT_PAGE_SIZE,
): PaginatedResult<T> => ({
  items: [],
  meta: createPaginationMeta(offset, limit),
});

export const buildOffsetHref = (
  pathname: string,
  params: Record<string, string | number | undefined | null>,
  offset: number,
): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    searchParams.set(key, String(value));
  }

  if (offset > 0) {
    searchParams.set("offset", String(offset));
  } else {
    searchParams.delete("offset");
  }

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
};

export const buildPageHref = (
  pathname: string,
  params: Record<string, string | number | undefined | null>,
  page: number,
): string => buildOffsetHref(pathname, params, page - 1);

export const parsePageParam = (value?: string | string[] | null): number =>
  Math.floor(parseOffsetParam(value) / DEFAULT_PAGE_SIZE) + 1;

export const getPageRange = (
  offset: number,
  limit: number,
  total: number,
): { from: number; to: number } => {
  if (total === 0) return { from: 0, to: 0 };

  const from = offset + 1;

  return {
    from,
    to: Math.min(offset + limit, total),
  };
};

const ELLIPSIS = "ellipsis" as const;

export const getPaginationItems = (
  offset: number,
  limit: number,
  total: number,
): (number | typeof ELLIPSIS)[] => {
  if (total === 0) return [];

  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return [0];

  const currentPage = Math.floor(offset / limit);

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index * limit);
  }

  const pages = new Set<number>([
    0,
    (totalPages - 1) * limit,
    Math.max(0, (currentPage - 1) * limit),
    currentPage * limit,
    Math.min((totalPages - 1) * limit, (currentPage + 1) * limit),
  ]);

  if (currentPage <= 4) {
    for (const value of [1, 2, 3, 4, 5])
      pages.add(Math.min(value * limit, (totalPages - 1) * limit));
  }

  if (currentPage >= totalPages - 4) {
    for (const value of [
      totalPages - 5,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
    ]) {
      if (value >= 0) pages.add(value * limit);
    }
  }

  const sorted = [...pages]
    .filter((value) => value >= 0 && value <= (totalPages - 1) * limit)
    .sort((a, b) => a - b);

  const items: (number | typeof ELLIPSIS)[] = [];
  let previous = -1;

  for (const value of sorted) {
    if (previous >= 0 && value - previous > limit) {
      items.push(ELLIPSIS);
    }

    items.push(value);
    previous = value;
  }

  return items;
};
