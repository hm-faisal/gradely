import type { CookieOptions, Response } from "express";
import { envConfig } from "../config/env.config";

export const AUTH_COOKIE_NAMES = {
	accessToken: "accessToken",
	refreshToken: "refreshToken",
} as const;

const DURATION_UNITS: Record<string, number> = {
	ms: 1,
	s: 1000,
	m: 60 * 1000,
	h: 60 * 60 * 1000,
	d: 24 * 60 * 60 * 1000,
	w: 7 * 24 * 60 * 60 * 1000,
};

const durationToMs = (duration: string): number | undefined => {
	const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w)?$/i.exec(duration.trim());

	if (!match?.[1]) {
		return undefined;
	}

	const amount = Number(match[1]);
	const unit = (match[2] ?? "ms").toLowerCase();
	const multiplier = DURATION_UNITS[unit];

	if (!Number.isFinite(amount) || multiplier === undefined) {
		return undefined;
	}

	return Math.floor(amount * multiplier);
};

const createCookieOptions = (maxAge?: number): CookieOptions => ({
	httpOnly: true,
	secure: envConfig.NODE_ENV === "production",
	sameSite: "lax",
	path: "/",
	...(maxAge !== undefined ? { maxAge } : {}),
});

export const setAuthCookies = (
	res: Response,
	tokens: { accessToken: string; refreshToken: string },
): void => {
	res.cookie(
		AUTH_COOKIE_NAMES.accessToken,
		tokens.accessToken,
		createCookieOptions(durationToMs(envConfig.JWT_ACCESS_TOKEN_EXPIRY)),
	);

	res.cookie(
		AUTH_COOKIE_NAMES.refreshToken,
		tokens.refreshToken,
		createCookieOptions(durationToMs(envConfig.JWT_REFRESH_TOKEN_EXPIRY)),
	);
};
