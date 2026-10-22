export type AuthUser = {
	id: string;
	name: string;
	email: string;
	role: string;
	createdAt?: string;
	updatedAt?: string;
};

export type LoginPayload = {
	email: string;
	password: string;
};

export type RegisterPayload = {
	name: string;
	email: string;
	password: string;
};

export type AuthField = "name" | "email" | "password";

export type AuthFieldErrors = Partial<Record<AuthField, string>>;

export type AuthActionResult =
	| { success: true; user: AuthUser }
	| { success: false; message: string; fieldErrors?: AuthFieldErrors };
