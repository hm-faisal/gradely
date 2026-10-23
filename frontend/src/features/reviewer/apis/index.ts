import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth.constants";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/constants/pagination.constants";
import type { Submission } from "@/features/submissions/types";
import type { ApiEnvelope } from "@/types/auth";
import type { PaginatedResult, PaginationMeta } from "@/types/pagination";
import { createPaginationMeta, emptyPaginatedResult } from "@/utils/pagination";

type QueryParams = Record<string, string | number | boolean | undefined>;

const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const readAccessToken = async () =>
  (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

type ApiResult<T> = {
  data: T;
  meta?: PaginationMeta;
};

const buildQuery = (params: QueryParams): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    searchParams.set(key, String(value));
  }

  return searchParams.toString();
};

const requestApi = async <T>(
  endpoint: string,
): Promise<ApiResult<T> | null> => {
  const baseUrl = getApiBaseUrl();
  const token = await readAccessToken();

  if (!baseUrl || !token) return null;

  try {
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      headers: {
        Accept: "application/json",
        Cookie: `${ACCESS_TOKEN_COOKIE}=${token}`,
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as ApiEnvelope<T> & {
      meta?: PaginationMeta;
    };

    if (
      !response.ok ||
      !payload.success ||
      payload.data === undefined ||
      payload.data === null
    ) {
      if (payload.error?.message) {
        console.error(`[reviewer] ${endpoint}: ${payload.error.message}`);
      }
      return null;
    }

    return { data: payload.data, meta: payload.meta };
  } catch (error) {
    console.error(`[reviewer] Unable to reach "${endpoint}"`, error);
    return null;
  }
};

const toPaginatedResult = (
  result: ApiResult<Submission[]> | null,
  page: number,
  limit: number,
): PaginatedResult<Submission> => {
  if (!result || !Array.isArray(result.data)) {
    return emptyPaginatedResult<Submission>(page, limit);
  }

  return {
    items: result.data,
    meta: result.meta ?? createPaginationMeta(page, limit, result.data.length),
  };
};

const getAllPages = async (params: QueryParams = {}) => {
  const buildEndpoint = (page: number) =>
    `submissions?${buildQuery({ ...params, limit: MAX_PAGE_SIZE, page })}`;

  const first = await requestApi<Submission[]>(buildEndpoint(1));

  if (!first || !Array.isArray(first.data)) return [];

  const totalPages = Math.max(first.meta?.totalPages ?? 1, 1);

  if (totalPages <= 1) return first.data;

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      requestApi<Submission[]>(buildEndpoint(index + 2)),
    ),
  );

  return [...first.data, ...remaining.flatMap((page) => page?.data ?? [])];
};

export const getMyAssignedSubmissions = cache(
  async (
    reviewerId: string,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedResult<Submission>> => {
    const result = await requestApi<Submission[]>(
      `submissions?${buildQuery({
        reviewerId,
        status: "PENDING",
        page,
        limit,
      })}`,
    );

    return toPaginatedResult(result, page, limit);
  },
);

export const getMyReviewedSubmissions = cache(
  async (
    reviewerId: string,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedResult<Submission>> => {
    const result = await requestApi<Submission[]>(
      `submissions?${buildQuery({
        reviewerId,
        reviewed: true,
        page,
        limit,
      })}`,
    );

    return toPaginatedResult(result, page, limit);
  },
);

export const getMyReviewCounts = cache(
  async (
    reviewerId: string,
  ): Promise<{ approved: number; rejected: number }> => {
    const [approved, rejected] = await Promise.all([
      requestApi<Submission[]>(
        `submissions?${buildQuery({
          reviewerId,
          status: "APPROVED",
          page: 1,
          limit: 1,
        })}`,
      ),
      requestApi<Submission[]>(
        `submissions?${buildQuery({
          reviewerId,
          status: "REJECTED",
          page: 1,
          limit: 1,
        })}`,
      ),
    ]);

    return {
      approved: approved?.meta?.total ?? 0,
      rejected: rejected?.meta?.total ?? 0,
    };
  },
);

/** Fetches every assigned submission, for dashboard summaries. */
export const getAllMyAssignedSubmissions = cache(
  async (reviewerId: string): Promise<Submission[]> =>
    getAllPages({ reviewerId, status: "PENDING" }),
);

/** Fetches every reviewed submission, for dashboard summaries. */
export const getAllMyReviewedSubmissions = cache(
  async (reviewerId: string): Promise<Submission[]> =>
    getAllPages({ reviewerId, reviewed: true }),
);
