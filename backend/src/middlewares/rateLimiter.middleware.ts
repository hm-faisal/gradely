import rateLimit from "express-rate-limit";
import httpStatus from "http-status";
import { envConfig } from "../config/env.config";

const createRateLimiter = ({
	windowMs,
	max,
	message,
	code = "TOO_MANY_REQUESTS",
}: {
	windowMs: number;
	max: number;
	message: string;
	code?: string;
}) =>
	rateLimit({
		windowMs,
		limit: max,
		standardHeaders: "draft-8",
		legacyHeaders: false,
		statusCode: httpStatus.TOO_MANY_REQUESTS,
		handler: (_req, res) => {
			res.status(httpStatus.TOO_MANY_REQUESTS).json({
				success: false,
				message,
				data: null,
				error: {
					code,
					message,
				},
			});
		},
	});

export const apiRateLimiter = createRateLimiter({
	windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
	max: envConfig.RATE_LIMIT_MAX,
	message: "Too many requests from this IP, please try again later",
	code: "RATE_LIMIT_EXCEEDED",
});

export const authRateLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: envConfig.AUTH_RATE_LIMIT_MAX,
	message: "Too many authentication attempts, please try again after 15 minutes",
	code: "AUTH_RATE_LIMIT_EXCEEDED",
});

export const submissionRateLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 30,
	message: "Too many submission attempts, please try again after 15 minutes",
	code: "SUBMISSION_RATE_LIMIT_EXCEEDED",
});
