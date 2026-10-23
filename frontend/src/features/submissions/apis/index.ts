import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth.constants";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/constants/pagination.constants";
import type { AuthUser } from "@/features/auth/types";
import { getSessionUserFromToken } from "@/lib/auth";
import type { ApiEnvelope } from "@/types/auth";
import type { PaginatedResult, PaginationMeta } from "@/types/pagination";
import { createPaginationMeta, emptyPaginatedResult } from "@/utils/pagination";
import type { Submission } from "../types";

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

    if (!response.ok) {
      console.error(
        `[submissions] Request to "${endpoint}" failed with ${response.status}`,
      );
      return null;
    }

    const payload = (await response.json()) as ApiEnvelope<T> & {
      meta?: PaginationMeta;
    };

    if (
      !payload.success ||
      payload.data === undefined ||
      payload.data === null
    ) {
      return null;
    }

    return { data: payload.data, meta: payload.meta };
  } catch (error) {
    console.error(`[submissions] Unable to reach "${endpoint}"`, error);
    return null;
  }
};

const toPaginatedResult = (
  result: ApiResult<Submission[]> | null,
  offset: number,
  limit: number,
): PaginatedResult<Submission> => {
  if (!result || !Array.isArray(result.data)) {
    return emptyPaginatedResult<Submission>(offset, limit);
  }

  return {
    items: result.data,
    meta: result.meta ?? createPaginationMeta(offset, limit, result.data.length),
  };
};

const getSubmissionsPage = async (
  offset: number,
  params: QueryParams = {},
  limit = MAX_PAGE_SIZE,
) =>
  requestApi<Submission[]>(
    `submissions/me?${buildQuery({ ...params, limit, offset })}`,
  );

const getAllSubmissions = async (params: QueryParams = {}) => {
  const first = await getSubmissionsPage(0, params);

  if (!first || !Array.isArray(first.data)) return [];

  const total = first.meta?.total ?? first.data.length;
  const totalPages = Math.max(Math.ceil(total / MAX_PAGE_SIZE), 1);

  if (totalPages <= 1) return first.data;

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getSubmissionsPage((index + 1) * MAX_PAGE_SIZE, params),
    ),
  );

  return [...first.data, ...remaining.flatMap((page) => page?.data ?? [])];
};

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const user = (await requestApi<AuthUser>("users/me"))?.data;

  if (user) return user;

  const token = await readAccessToken();

  if (!token) return null;

  const session = getSessionUserFromToken(token);

  if (!session) return null;

  return {
    id: session.id,
    name: session.email.split("@")[0] || "Student",
    email: session.email,
    role: session.role,
  };
});

export const getMySubmissions = cache(
  async (
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
    search?: string,
  ): Promise<PaginatedResult<Submission>> => {
    const result = await getSubmissionsPage(
      offset,
      search ? { searchParam: search, search } : {},
      limit,
    );

    return toPaginatedResult(result, offset, limit);
  },
);

export const getMyFeedback = cache(
  async (
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
    search?: string,
  ): Promise<PaginatedResult<Submission>> => {
    const result = await getSubmissionsPage(
      offset,
      { hasFeedback: true, ...(search ? { searchParam: search, search } : {}) },
      limit,
    );

    return toPaginatedResult(result, offset, limit);
  },
);

export const getAllMySubmissions = cache(
  async (): Promise<Submission[]> => getAllSubmissions(),
);
