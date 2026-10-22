import { z } from "zod";
import {
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
} from "../constants/auth.constants";
import { validateWith } from "./utils";

/**
 * Login only checks that a password is present and within the API limit.
 * Strength rules are enforced on registration and password changes.
 */
export const loginPasswordSchema = z
	.string({ error: "Password is required" })
	.min(1, { error: "Password is required" })
	.max(PASSWORD_MAX_LENGTH, {
		error: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
	});

/**
 * Password schema for account creation and password changes. Requires at
 * least one lowercase letter, one uppercase letter, one number, and one
 * special character. Passwords are never trimmed or lowercased.
 */
export const passwordSchema = z
	.string({ error: "Password is required" })
	.min(1, { error: "Password is required" })
	.min(PASSWORD_MIN_LENGTH, {
		error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
	})
	.max(PASSWORD_MAX_LENGTH, {
		error: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
	})
	.refine((value) => !/\s/.test(value), {
		error: "Password must not contain spaces",
	})
	.regex(/[a-z]/, {
		error: "Password must contain at least one lowercase letter",
	})
	.regex(/[A-Z]/, {
		error: "Password must contain at least one uppercase letter",
	})
	.regex(/\d/, { error: "Password must contain at least one number" })
	.regex(/[^A-Za-z0-9\s]/, {
		error: "Password must contain at least one special character",
	});

/** Confirms that a password and its confirmation match. */
export function createConfirmPasswordSchema(password: string) {
	return z
		.string({ error: "Please confirm your password" })
		.min(1, { error: "Please confirm your password" })
		.refine((value) => value === password, {
			error: "Passwords do not match",
		});
}

export function validateLoginPassword(value: string): string | undefined {
	return validateWith(loginPasswordSchema, value);
}

export function validatePassword(value: string): string | undefined {
	return validateWith(passwordSchema, value);
}

export function validateConfirmPassword(
	password: string,
	confirmPassword: string,
): string | undefined {
	return validateWith(createConfirmPasswordSchema(password), confirmPassword);
}

/** Returns a score from 0 (very weak) to 4 (strong). */
export function getPasswordStrength(value: string): number {
	const checks = [
		value.length >= PASSWORD_MIN_LENGTH,
		/[a-z]/.test(value) && /[A-Z]/.test(value),
		/\d/.test(value),
		/[^A-Za-z0-9\s]/.test(value),
	];

	return checks.filter(Boolean).length;
}
