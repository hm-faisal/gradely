import type { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { envConfig } from "../config/env.config.ts";
import { AppError, defaultErrorCodeForStatus } from "../errors/app.error.ts";

const { JsonWebTokenError, NotBeforeError, TokenExpiredError } = jwt;
const {
	BAD_REQUEST: BAD,
	UNAUTHORIZED: AUTH,
	NOT_FOUND: NF,
	CONFLICT,
	INTERNAL_SERVER_ERROR: SERVER,
	SERVICE_UNAVAILABLE: DOWN,
	GATEWAY_TIMEOUT: SLOW,
} = httpStatus;

const DEFAULT_MESSAGE = "An unexpected internal error occurred";
const DB_CODE = /^(P\d{4}|[0-9][0-9A-Z]{4}|[A-Z][A-Z0-9]*\.[A-Z][A-Z0-9_]*)$/;

const isObj = (v: unknown): v is Record<string, unknown> =>
	typeof v === "object" && v !== null;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
const details = (v: unknown) =>
	v == null
		? undefined
		: Array.isArray(v)
			? { items: v }
			: isObj(v)
				? v
				: { detail: v };
const out = (
	status: number,
	code: string,
	message: string,
	d?: Record<string, unknown>,
) => ({ status, code, message, details: d });

const isZod = (v: unknown): v is ZodError =>
	v instanceof ZodError ||
	(isObj(v) && v.name === "ZodError" && Array.isArray(v.issues));

const isApp = (v: unknown): v is AppError =>
	v instanceof AppError ||
	(isObj(v) &&
		typeof v.statusCode === "number" &&
		v.statusCode >= 400 &&
		v.statusCode <= 599);

const isDb = (v: unknown): v is Record<string, unknown> =>
	isObj(v) &&
	((typeof v.name === "string" && v.name.startsWith("PrismaClient")) ||
		DB_CODE.test(String(v.code ?? v.sqlState ?? "")));

const dbError = (e: Record<string, unknown>) => {
	const raw = String(e.code ?? e.sqlState ?? "DATABASE_ERROR").toUpperCase();
	const fallback = str(e.why) ?? str(e.message) ?? "Database operation failed";
	const d = {
		...(str(e.detail) ? { detail: e.detail } : {}),
		...(str(e.table) ? { table: e.table } : {}),
		...(str(e.constraint) ? { constraint: e.constraint } : {}),
		...(isObj(e.meta) ? { meta: e.meta } : {}),
	};
	const x = Object.keys(d).length ? d : undefined;
	const fail = (status: number, code: string, message: string) =>
		out(status, code, message, x);

	switch (raw) {
		case "23505":
		case "P2002":
			return fail(
				CONFLICT,
				"CONFLICT",
				"A record with the same unique value already exists",
			);
		case "23503":
		case "P2003":
			return fail(BAD, "FOREIGN_KEY_VIOLATION", "Referenced record not found");
		case "23514":
			return fail(
				BAD,
				"CHECK_CONSTRAINT_VIOLATION",
				"Database constraint violated",
			);
		case "23502":
		case "P2011":
			return fail(BAD, "NOT_NULL_VIOLATION", "A required field is missing");
		case "22P02":
		case "P2005":
		case "P2023":
			return fail(BAD, "INVALID_INPUT", "Invalid input value");
		case "P2000":
			return fail(BAD, "VALUE_TOO_LONG", "A provided value is too long");
		case "40001":
		case "40P01":
		case "P2034":
			return fail(
				CONFLICT,
				"TRANSACTION_CONFLICT",
				"Transaction conflict; please retry",
			);
		case "P2001":
		case "P2025":
			return fail(NF, "NOT_FOUND", "Record not found");
		case "42P01":
		case "P2021":
			return fail(SERVER, "TABLE_NOT_FOUND", "Database table not found");
		case "42703":
		case "P2022":
			return fail(SERVER, "COLUMN_NOT_FOUND", "Database column not found");
		case "08006":
		case "57P01":
		case "P1001":
		case "P1017":
			return fail(
				DOWN,
				"DATABASE_UNAVAILABLE",
				"Database is temporarily unavailable",
			);
		case "57014":
		case "P1002":
		case "P1008":
			return fail(SLOW, "DATABASE_TIMEOUT", "Database operation timed out");
		case "28000":
		case "28P01":
		case "P1000":
			return fail(
				SERVER,
				"DATABASE_AUTHENTICATION_FAILED",
				"Database authentication failed",
			);
		case "3D000":
			return fail(SERVER, "DATABASE_NOT_FOUND", "Database not found");
		case "42501":
			return fail(SERVER, "DATABASE_ACCESS_DENIED", "Database access denied");
		case "P1012":
			return fail(
				SERVER,
				"DATABASE_SCHEMA_ERROR",
				"Database schema is out of date",
			);
	}

	if (/^[A-Z][A-Z0-9]*\./.test(raw)) {
		return out(
			raw.startsWith("RUNTIME.ARGUMENT") ? BAD : SERVER,
			raw,
			fallback,
			x,
		);
	}
	if (e.name === "PrismaClientValidationError") {
		return out(BAD, "VALIDATION_ERROR", fallback, x);
	}
	return out(SERVER, raw, fallback, x);
};

const normalize = (err: unknown) => {
	if (isZod(err))
		return out(BAD, "VALIDATION_ERROR", "Validation failed", {
			issues: err.issues.map((i) => ({
				field: i.path.map(String).join(".") || "root",
				message: i.message,
				code: i.code,
			})),
		});
	if (isApp(err))
		return out(
			err.statusCode,
			str(err.code) ?? defaultErrorCodeForStatus(err.statusCode),
			str(err.message) ?? DEFAULT_MESSAGE,
			details(err.details),
		);
	if (err instanceof TokenExpiredError)
		return out(AUTH, "TOKEN_EXPIRED", "Authentication token has expired", {
			expiredAt: err.expiredAt.toISOString(),
		});
	if (err instanceof NotBeforeError)
		return out(
			AUTH,
			"TOKEN_NOT_ACTIVE",
			"Authentication token is not active yet",
			{ notBefore: err.date.toISOString() },
		);
	if (err instanceof JsonWebTokenError)
		return out(
			AUTH,
			"INVALID_TOKEN",
			"Invalid or malformed authentication token",
		);
	if (err instanceof SyntaxError && "body" in err)
		return out(BAD, "MALFORMED_JSON", "Malformed JSON payload in request body");
	if (isDb(err)) return dbError(err);
	if (err instanceof Error)
		return out(
			SERVER,
			str((err as { code?: unknown }).code) ?? "INTERNAL_SERVER_ERROR",
			str(err.message) ?? DEFAULT_MESSAGE,
		);
	if (typeof err === "string" && err.trim())
		return out(SERVER, "INTERNAL_SERVER_ERROR", err);
	return out(SERVER, "INTERNAL_SERVER_ERROR", DEFAULT_MESSAGE);
};

export const globalErrorHandler: ErrorRequestHandler = (
	err,
	_req,
	res,
	next,
): void => {
	if (res.headersSent) {
		next(err);
		return;
	}

	const result = normalize(err);

	if (
		envConfig.NODE_ENV === "production" &&
		result.status >= 500 &&
		!(err instanceof AppError && err.isOperational)
	) {
		result.message = DEFAULT_MESSAGE;
		result.details = undefined;
	}

	if (envConfig.NODE_ENV !== "production")
		console.error("[GlobalErrorHandler]", err);

	const { status, code, message, details } = result;
	res.status(status).json({
		success: false,
		message,
		data: null,
		error: { code, message, ...(details ? { details } : {}) },
	});
};

export default globalErrorHandler;
