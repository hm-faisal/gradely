const STATUS_ERROR_CODES: Record<number, string> = {
	400: "BAD_REQUEST",
	401: "UNAUTHORIZED",
	403: "FORBIDDEN",
	404: "NOT_FOUND",
	405: "METHOD_NOT_ALLOWED",
	409: "CONFLICT",
	413: "PAYLOAD_TOO_LARGE",
	415: "UNSUPPORTED_MEDIA_TYPE",
	422: "UNPROCESSABLE_ENTITY",
	429: "TOO_MANY_REQUESTS",
	500: "INTERNAL_SERVER_ERROR",
	501: "NOT_IMPLEMENTED",
	502: "BAD_GATEWAY",
	503: "SERVICE_UNAVAILABLE",
	504: "GATEWAY_TIMEOUT",
};

export const defaultErrorCodeForStatus = (statusCode: number): string =>
	STATUS_ERROR_CODES[statusCode] ??
	(statusCode >= 400 && statusCode < 500
		? "CLIENT_ERROR"
		: "INTERNAL_SERVER_ERROR");

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: string;
	public readonly isOperational: boolean;
	public readonly details?: unknown;

	constructor(
		message: string,
		statusCode = 500,
		details?: unknown,
		isOperational = true,
		code?: string,
	) {
		super(message);

		const safeStatusCode =
			Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
				? statusCode
				: 500;

		this.name = this.constructor.name;
		this.statusCode = safeStatusCode;
		this.code = code ?? defaultErrorCodeForStatus(safeStatusCode);
		this.isOperational = isOperational;
		this.details = details;
		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;
