export type ApiIssue = {
	field?: string;
	path?: readonly PropertyKey[];
	message?: string;
};

export type ApiEnvelope<T> = {
	success?: boolean;
	message?: string;
	data?: T;
	error?: {
		message?: string;
		details?: {
			issues?: ApiIssue[];
		};
	};
};
