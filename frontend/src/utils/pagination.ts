import { DEFAULT_PAGE_SIZE } from "@/constants/pagination.constants";
import type { PaginatedResult, PaginationMeta } from "@/types/pagination";

export const parsePageParam = (value?: string | string[] | null): number => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = Number(rawValue);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const createPaginationMeta = (
  page: number,
  limit: number,
  total = 0,
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

export const emptyPaginatedResult = <T>(
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
): PaginatedResult<T> => ({
  items: [],
  meta: createPaginationMeta(page, limit),
});

export const buildPageHref = (
  pathname: string,
  params: Record<string, string | number | undefined | null>,
  page: number,
): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    searchParams.set(key, String(value));
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  } else {
    searchParams.delete("page");
  }

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
};

export const getPageRange = (
  page: number,
  limit: number,
  total: number,
): { from: number; to: number } => {
  if (total === 0) return { from: 0, to: 0 };

  const from = (page - 1) * limit + 1;

  return {
    from,
    to: Math.min(page * limit, total),
  };
};

const ELLIPSIS = "ellipsis" as const;

export const getPaginationItems = (
  page: number,
  totalPages: number,
): (number | typeof ELLIPSIS)[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);

  if (page <= 4) {
    for (const value of [2, 3, 4, 5]) pages.add(value);
  }

  if (page >= totalPages - 3) {
    for (const value of [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
    ]) {
      pages.add(value);
    }
  }

  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | typeof ELLIPSIS)[] = [];
  let previous = 0;

  for (const value of sorted) {
    if (previous > 0 && value - previous > 1) {
      items.push(ELLIPSIS);
    }

    items.push(value);
    previous = value;
  }

  return items;
};
