import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth.constants";

export type SessionUser = {
	id: string;
	email: string;
	role: string;
};

type TokenPayload = Record<string, unknown>;

const decodeTokenPayload = (token: string): TokenPayload | null => {
	const payload = token.split(".")[1];

	if (!payload) return null;

	try {
		const decoded = Buffer.from(payload, "base64url").toString("utf8");
		const parsed: unknown = JSON.parse(decoded);

		if (!parsed || typeof parsed !== "object") return null;

		return parsed as TokenPayload;
	} catch {
		return null;
	}
};

/**
 * Decodes the user data carried by an access token.
 *
 * This is an optimistic check: the signature is verified by the backend when
 * the token is used, so it must not be treated as a secure authorization
 * decision on its own.
 */
export const getSessionUserFromToken = (token: string): SessionUser | null => {
	const payload = decodeTokenPayload(token);

	if (!payload) return null;

	if (typeof payload.exp === "number" && payload.exp <= Date.now() / 1000) {
		return null;
	}

	const { id, email, role } = payload;

	if (
		typeof id !== "string" ||
		typeof email !== "string" ||
		typeof role !== "string"
	) {
		return null;
	}

	return { id, email, role };
};

/**
 * Reads the access token cookie and returns the user data it carries.
 */
export const getSessionUser = (request: NextRequest): SessionUser | null => {
	const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

	if (!token) return null;

	return getSessionUserFromToken(token);
};
