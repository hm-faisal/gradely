import type { RequestHandler } from "express";

/**
 * Wraps an Express request handler so rejected promises and synchronous
 * errors are forwarded to the global error handler.
 */
export const catchAsync = (fn: RequestHandler): RequestHandler => {
	return (req, res, next) => {
		Promise.resolve()
			.then(() => fn(req, res, next))
			.catch(next);
	};
};
