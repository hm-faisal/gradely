"use server";

import { ApiEnvelope, ApiIssue } from "@/types/auth";
import { apiInstanse } from "@/utils/api";
import { cookies } from "next/headers";
import { loginSchema } from "../schemas/login.schema";
import type {
	AuthActionResult,
	AuthFieldErrors,
	AuthUser,
	LoginPayload,
} from "../types";

type AuthTokens = {
	accessToken?: string;
	refreshToken?: string;
};

const ACCESS_TOKEN_MAX_AGE = 60 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

function toFieldErrors(
	issues?: readonly ApiIssue[],
): AuthFieldErrors | undefined {
	if (!issues?.length) return undefined;

	const fieldErrors: AuthFieldErrors = {};

	for (const issue of issues) {
		const candidate = issue.field ?? issue.path?.[0];
		const field = typeof candidate === "string" ? candidate : undefined;

		if ((field === "email" || field === "password") && !fieldErrors[field]) {
			fieldErrors[field] = issue.message ?? "Invalid value";
		}
	}

	return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

async function storeAuthCookies(tokens?: AuthTokens): Promise<void> {
	const cookieStore = await cookies();
	const baseOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
	};

	if (tokens?.accessToken) {
		cookieStore.set("accessToken", tokens.accessToken, {
			...baseOptions,
			maxAge: ACCESS_TOKEN_MAX_AGE,
		});
	}

	if (tokens?.refreshToken) {
		cookieStore.set("refreshToken", tokens.refreshToken, {
			...baseOptions,
			maxAge: REFRESH_TOKEN_MAX_AGE,
		});
	}
}

export const loginAction = async (
	input: LoginPayload,
): Promise<AuthActionResult> => {
	const parsed = loginSchema.safeParse(input);

	if (!parsed.success) {
		const fieldErrors = toFieldErrors(parsed.error.issues);

		return {
			success: false,
			message: parsed.error.issues[0]?.message ?? "Invalid credentials",
			...(fieldErrors ? { fieldErrors } : {}),
		};
	}

	const response = (await apiInstanse("auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(parsed.data),
		cache: "no-store",
	})) as ApiEnvelope<{ user: AuthUser; tokens: AuthTokens }> | Error | null;

	if (response instanceof Error) {
		return {
			success: false,
			message:
				response.message || "Unable to reach the server. Please try again.",
		};
	}

	if (!response?.success || !response.data?.user) {
		const fieldErrors = toFieldErrors(response?.error?.details?.issues);

		return {
			success: false,
			message:
				response?.error?.message ??
				response?.message ??
				"Something went wrong. Please try again.",
			...(fieldErrors ? { fieldErrors } : {}),
		};
	}

	await storeAuthCookies(response.data.tokens);

	return { success: true, user: response.data.user };
};
