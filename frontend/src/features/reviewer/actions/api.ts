import "server-only";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth.constants";
import type { ApiEnvelope, ApiIssue } from "@/types/auth";

type MutationResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      message: string;
      issues?: readonly ApiIssue[];
    };

export const mutateReviewerApi = async <T>(
  endpoint: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<MutationResult<T>> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!baseUrl || !token) {
    return {
      ok: false,
      message: "Your session has expired. Please sign in again.",
    };
  }

  try {
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method,
      headers: {
        Accept: "application/json",
        Cookie: `${ACCESS_TOKEN_COOKIE}=${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const payload = (await response.json()) as ApiEnvelope<T>;

    if (!response.ok || !payload.success) {
      return {
        ok: false,
        message:
          payload.error?.message ??
          payload.message ??
          "The request could not be completed. Please try again.",
        issues: payload.error?.details?.issues,
      };
    }

    return { ok: true, data: payload.data as T };
  } catch (error) {
    console.error(`[reviewer] Unable to reach "${endpoint}"`, error);
    return {
      ok: false,
      message: "Unable to reach the server. Please try again.",
    };
  }
};
