"use server";

import { cookies } from "next/headers";
import { loginSchema, registerSchema } from "@/validations";
import type {
  AuthActionResult,
  AuthFieldErrors,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "./types";

/**
 * Base URL of the Gradely API. `API_URL` lets you point at an internal
 * host (for example inside Docker); otherwise the public URL is used.
 */
const API_BASE_URL = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

type ApiIssue = {
  /** Field name used by the Gradely API error envelope. */
  field?: string;
  /** Zod issue path, used for client-side validation errors. */
  path?: readonly PropertyKey[];
  message?: string;
};

type ApiEnvelope = {
  success?: boolean;
  message?: string;
  data?: { user?: AuthUser };
  error?: {
    code?: string;
    message?: string;
    details?: { issues?: ApiIssue[] };
  };
};

type CookieOptions = {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
  partitioned?: boolean;
  priority?: "low" | "medium" | "high";
};

function getSetCookieHeaders(headers: Headers): string[] {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;

  if (typeof getSetCookie === "function") {
    return getSetCookie.call(headers);
  }

  const header = headers.get("set-cookie");

  return header ? [header] : [];
}

function parseCookieOptions(attributes: string[]): CookieOptions {
  const options: CookieOptions = {};

  for (const attribute of attributes) {
    const separator = attribute.indexOf("=");
    const key = (separator === -1 ? attribute : attribute.slice(0, separator))
      .trim()
      .toLowerCase();
    const rawValue =
      separator === -1 ? "" : attribute.slice(separator + 1).trim();
    const value = rawValue.toLowerCase();

    switch (key) {
      case "path":
        options.path = rawValue || "/";
        break;
      case "domain":
        options.domain = rawValue;
        break;
      case "max-age": {
        const maxAge = Number.parseInt(rawValue, 10);
        if (Number.isFinite(maxAge)) options.maxAge = maxAge;
        break;
      }
      case "expires": {
        const expires = new Date(rawValue);
        if (!Number.isNaN(expires.getTime())) options.expires = expires;
        break;
      }
      case "secure":
        options.secure = true;
        break;
      case "httponly":
        options.httpOnly = true;
        break;
      case "samesite":
        if (value === "lax" || value === "strict" || value === "none") {
          options.sameSite = value;
        }
        break;
      case "partitioned":
        options.partitioned = true;
        break;
      case "priority":
        if (value === "low" || value === "medium" || value === "high") {
          options.priority = value;
        }
        break;
    }
  }

  return options;
}

/**
 * The API stores the JWTs in http-only cookies. Requests made from a server
 * action do not reach the browser, so copy every `Set-Cookie` header onto the
 * outgoing response through `cookies()`.
 */
async function forwardAuthCookies(setCookieHeaders: string[]): Promise<void> {
  if (setCookieHeaders.length === 0) return;

  const cookieStore = await cookies();

  for (const header of setCookieHeaders) {
    const [pair, ...attributes] = header.split(";");
    const separator = pair.indexOf("=");

    if (separator < 1) continue;

    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();

    if (!name) continue;

    cookieStore.set(name, value, parseCookieOptions(attributes));
  }
}

function toFieldErrors(
  issues?: readonly ApiIssue[],
): AuthFieldErrors | undefined {
  if (!issues?.length) return undefined;

  const fieldErrors: AuthFieldErrors = {};

  for (const issue of issues) {
    const candidate = issue.field ?? issue.path?.[0];
    const field = typeof candidate === "string" ? candidate : undefined;

    if (
      (field === "name" || field === "email" || field === "password") &&
      !fieldErrors[field]
    ) {
      fieldErrors[field] = issue.message ?? "Invalid value";
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

async function submitAuth(
  path: "/login" | "/register",
  payload: LoginPayload | RegisterPayload,
): Promise<AuthActionResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = (await response
      .json()
      .catch(() => null)) as ApiEnvelope | null;

    if (!response.ok || !body?.success || !body.data?.user) {
      const fieldErrors = toFieldErrors(body?.error?.details?.issues);

      return {
        success: false,
        message:
          body?.error?.message ??
          body?.message ??
          "Something went wrong. Please try again.",
        ...(fieldErrors ? { fieldErrors } : {}),
      };
    }

    await forwardAuthCookies(getSetCookieHeaders(response.headers));

    return { success: true, user: body.data.user };
  } catch {
    return {
      success: false,
      message: "Unable to reach the server. Please try again.",
    };
  }
}

export async function loginAction(
  input: LoginPayload,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error.issues);

    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid credentials",
      ...(fieldErrors ? { fieldErrors } : {}),
    };
  }

  return submitAuth("/login", parsed.data);
}

export async function registerAction(
  input: RegisterPayload,
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error.issues);

    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid details",
      ...(fieldErrors ? { fieldErrors } : {}),
    };
  }

  return submitAuth("/register", parsed.data);
}
