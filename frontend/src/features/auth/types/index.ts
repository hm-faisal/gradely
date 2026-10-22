export type Feedback = {
  status: "success" | "error";
  message: string;
};

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

/**
 * Server actions never throw for expected failures: they return a serialisable
 * result so the form can render the message (thrown errors are redacted in
 * production builds).
 */
export type AuthActionResult =
  | { success: true; user: AuthUser }
  | { success: false; message: string; fieldErrors?: AuthFieldErrors };
