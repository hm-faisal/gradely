import { z } from "zod";

export const sanitizeString = (input: string): string => {
	if (typeof input !== "string") return input;

	return input
		.replace(/\0/g, "")
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
		.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
		.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
		.replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, "")
		.replace(/\bon\w+\s*=\s*[^\s>]+/gi, "")
		.replace(/(javascript|vbscript|data):/gi, "$1_disarmed:")
		.trim();
};

export const sanitizeObject = <T>(data: T): T => {
	if (data === null || data === undefined) {
		return data;
	}

	if (typeof data === "string") {
		return sanitizeString(data) as unknown as T;
	}

	if (Array.isArray(data)) {
		return data.map((item) => sanitizeObject(item)) as unknown as T;
	}

	if (typeof data === "object") {
		const sanitized: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(
			data as Record<string, unknown>,
		)) {
			if (key === "__proto__" || key === "constructor" || key === "prototype") {
				continue;
			}
			const sanitizedKey = sanitizeString(key);
			sanitized[sanitizedKey] = sanitizeObject(value);
		}
		return sanitized as T;
	}

	return data;
};

export const sanitizedString = (minLength = 1, maxLength?: number) => {
	const base = z
		.string()
		.trim()
		.transform((val) => sanitizeString(val));
	let stringValidator = z.string().min(minLength);
	if (maxLength !== undefined) {
		stringValidator = stringValidator.max(maxLength);
	}
	return base.pipe(stringValidator);
};
