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
import type {
  AdminFeedback,
  AdminSummary,
  AdminUser,
  AdminUserDetails,
  UserRole,
} from "../types";

const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const readAccessToken = async () =>
  (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

type AdminApiResult<T> = {
  data: T;
  meta?: PaginationMeta;
};

type QueryParams = Record<string, string | number | boolean | undefined>;

const buildQuery = (params: QueryParams): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    searchParams.set(key, String(value));
  }

  return searchParams.toString();
};

const toPaginatedResult = <T>(
  result: AdminApiResult<T[]> | null,
  offset: number,
  limit: number,
): PaginatedResult<T> => {
  if (!result || !Array.isArray(result.data)) {
    return emptyPaginatedResult<T>(offset, limit);
  }

  return {
    items: result.data,
    meta: result.meta ?? createPaginationMeta(offset, limit, result.data.length),
  };
};

export const requestAdminApi = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<AdminApiResult<T> | null> => {
  const baseUrl = getApiBaseUrl();
  const token = await readAccessToken();

  if (!baseUrl || !token) return null;

  try {
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/json",
        Cookie: `${ACCESS_TOKEN_COOKIE}=${token}`,
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as ApiEnvelope<T> & {
      meta?: PaginationMeta;
      error?: { message?: string };
    };

    if (!response.ok || !payload.success) {
      if (payload.error?.message) {
        console.error(`[admin] ${endpoint}: ${payload.error.message}`);
      }
      return null;
    }

    if (payload.data === undefined || payload.data === null) return null;

    return { data: payload.data, meta: payload.meta };
  } catch (error) {
    console.error(`[admin] Unable to reach "${endpoint}"`, error);
    return null;
  }
};

const getAllPages = async <T>(
  endpoint: string,
  params: QueryParams = {},
  pageSize = MAX_PAGE_SIZE,
) => {
  const buildEndpoint = (offset: number) =>
    `${endpoint}?${buildQuery({ ...params, limit: pageSize, offset })}`;

  const first = await requestAdminApi<T[]>(buildEndpoint(0));

  if (!first || !Array.isArray(first.data)) return [];

  const total = first.meta?.total ?? first.data.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  if (totalPages <= 1) return first.data;

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      requestAdminApi<T[]>(buildEndpoint((index + 1) * pageSize)),
    ),
  );

  return [...first.data, ...remaining.flatMap((page) => page?.data ?? [])];
};

export const getAdminSummary = cache(async (): Promise<AdminSummary | null> => {
  const result = await requestAdminApi<AdminSummary>("admin/summary");
  return result?.data ?? null;
});

export const getAdminSubmissions = cache(
  async (
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
    search?: string,
  ): Promise<PaginatedResult<Submission>> => {
    const result = await requestAdminApi<Submission[]>(
      `submissions?${buildQuery({ offset, limit, searchParam: search, search })}`,
    );

    return toPaginatedResult(result, offset, limit);
  },
);

export const getAdminUnassignedPendingCount = cache(
  async (): Promise<number> => {
    const result = await requestAdminApi<Submission[]>(
      `submissions?${buildQuery({
        status: "PENDING",
        unassigned: true,
        offset: 0,
        limit: 1,
      })}`,
    );

    return result?.meta?.total ?? 0;
  },
);

export const getAdminFeedbacks = cache(
  async (
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
    search?: string,
  ): Promise<PaginatedResult<AdminFeedback>> => {
    const result = await requestAdminApi<AdminFeedback[]>(
      `feedbacks?${buildQuery({ offset, limit, searchParam: search, search })}`,
    );

    return toPaginatedResult(result, offset, limit);
  },
);

export const getAdminFeedback = cache(
  async (id: string): Promise<AdminFeedback | null> => {
    const result = await requestAdminApi<AdminFeedback>(`feedbacks/${id}`);
    return result?.data ?? null;
  },
);

export const getAdminUsers = cache(
  async (
    offset = 0,
    role?: UserRole,
    limit = DEFAULT_PAGE_SIZE,
    search?: string,
  ): Promise<PaginatedResult<AdminUser>> => {
    const result = await requestAdminApi<AdminUser[]>(
      `users?${buildQuery({ offset, limit, role, searchParam: search, search })}`,
    );

    return toPaginatedResult(result, offset, limit);
  },
);

export const getAllAdminUsers = cache(
  async (role?: UserRole): Promise<AdminUser[]> =>
    getAllPages<AdminUser>("users", role ? { role } : {}),
);

export const getAdminUserDetails = cache(
  async (id: string): Promise<AdminUserDetails | null> => {
    const result = await requestAdminApi<AdminUserDetails>(`users/${id}`);
    return result?.data ?? null;
  },
);
