import type { RequestHandler } from "express";
import httpStatus from "http-status";
import type z from "zod";
import { AppError } from "../errors";
import { catchAsync } from "../utils/catchAsync";

declare global {
	namespace Express {
		interface Request {
			validatedQuery?: unknown;
		}
	}
}

const validationError = (error: z.ZodError): AppError => {
	const issues = error.issues.map((issue) => ({
		field: issue.path.map(String).join(".") || "root",
		message: issue.message,
		code: issue.code,
	}));

	return new AppError(
		issues[0]?.message ?? "Validation failed",
		httpStatus.BAD_REQUEST,
		{ issues },
	);
};

export const validateRequest = (zodSchema: z.ZodType): RequestHandler => {
	return catchAsync((req, _res, next) => {
		const result = zodSchema.safeParse(req.body ?? {});

		if (!result.success) {
			throw validationError(result.error);
		}

		req.body = result.data;
		next();
	});
};

export const validateQuery = (zodSchema: z.ZodType): RequestHandler => {
	return catchAsync((req, _res, next) => {
		const result = zodSchema.safeParse(req.query ?? {});

		if (!result.success) {
			throw validationError(result.error);
		}

		req.validatedQuery = result.data;
		next();
	});
};
