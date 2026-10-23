import type { NextFunction, Request, Response } from "express";
import { sanitizeObject } from "../utils/sanitize.ts";

export const sanitizeInput = (
	req: Request,
	_res: Response,
	next: NextFunction,
): void => {
	if (req.body && typeof req.body === "object") {
		req.body = sanitizeObject(req.body);
	}

	if (req.query && typeof req.query === "object") {
		const sanitizedQuery = sanitizeObject(req.query);
		Object.defineProperty(req, "query", {
			value: sanitizedQuery,
			writable: true,
			enumerable: true,
			configurable: true,
		});
	}

	if (req.params && typeof req.params === "object") {
		req.params = sanitizeObject(req.params);
	}

	next();
};

export default sanitizeInput;
