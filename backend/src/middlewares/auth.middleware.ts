import type { Request, RequestHandler } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors";
import { catchAsync } from "../utils/catchAsync";
import { AUTH_COOKIE_NAMES } from "../utils/cookie";
import {
	type AccessTokenPayload,
	type UserRole,
	verifyAccessToken,
} from "../utils/jwt";

declare global {
	namespace Express {
		interface Request {
			user?: AccessTokenPayload;
		}
	}
}

const extractCookieToken = (req: Request): string | undefined => {
	const token: unknown = req.cookies?.[AUTH_COOKIE_NAMES.accessToken];

	if (typeof token !== "string" || token.length === 0) {
		return undefined;
	}

	return token;
};

const extractBearerToken = (req: Request): string | undefined => {
	const header = req.headers.authorization;
	if (!header) return undefined;

	const [scheme, token] = header.split(" ");
	if (scheme?.toLowerCase() !== "bearer" || !token) return undefined;

	return token;
};

const extractAccessToken = (req: Request): string | undefined =>
	extractCookieToken(req) ?? extractBearerToken(req);

export const authenticate: RequestHandler = catchAsync((req, _res, next) => {
	const token = extractAccessToken(req);

	if (!token) {
		throw new UnauthorizedError("Authentication required");
	}

	req.user = verifyAccessToken(token);
	next();
});

export const authorize =
	(...roles: UserRole[]): RequestHandler =>
	(req, _res, next) => {
		if (!req.user) {
			next(new UnauthorizedError("Authentication required"));
			return;
		}

		if (!roles.includes(req.user.role)) {
			next(
				new ForbiddenError("You do not have permission to perform this action"),
			);
			return;
		}

		next();
	};

export const requireUser = (req: Request): AccessTokenPayload => {
	if (!req.user) {
		throw new UnauthorizedError("Authentication required");
	}

	return req.user;
};
