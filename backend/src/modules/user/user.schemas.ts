import { z } from "zod";
import { emailSchema } from "../../schemas/email.schema";
import { createPaginationSchema } from "../../schemas/pagination.schema";
import { passwordSchema } from "../../schemas/password.schema";
import { nameSchema } from "../../schemas/string.schema";

export const userRoleSchema = z.enum(["STUDENT", "ADMIN", "REVIEWER"]);

export const userStatusSchema = z.enum([
	"ACTIVE",
	"INACTIVE",
	"BANNED",
	"DELETED",
]);

export const updateUserSchema = z
	.object({
		name: nameSchema.optional(),
		email: emailSchema.optional(),
	})
	.refine((data) => data.name !== undefined || data.email !== undefined, {
		error: "At least one field must be provided",
	});

export const updateUserRoleSchema = z.object({
	role: userRoleSchema,
});

export const adminUserStatusSchema = z.enum(["ACTIVE", "INACTIVE", "BANNED"]);

export const adminUpdateUserSchema = z
	.object({
		name: nameSchema.optional(),
		email: emailSchema.optional(),
		role: userRoleSchema.optional(),
		status: adminUserStatusSchema.optional(),
	})
	.refine(
		(data) =>
			data.name !== undefined ||
			data.email !== undefined ||
			data.role !== undefined ||
			data.status !== undefined,
		{ error: "At least one field must be provided" },
	);

export const createReviewerSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	password: passwordSchema,
});

export const listUsersQuerySchema = createPaginationSchema(20).extend({
	role: userRoleSchema.optional(),
	status: userStatusSchema.optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type CreateReviewerInput = z.infer<typeof createReviewerSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
