"use server";

import type { ApiIssue } from "@/types/auth";
import { revalidatePath } from "next/cache";
import { updateUserSchema } from "../schemas/updateUser.schema";
import type { AdminUser, UpdateUserState, UserEditField } from "../types";
import { mutateAdminApi } from "./api";

const USER_FIELDS: UserEditField[] = ["name", "email", "role", "status"];

const isUserField = (value: unknown): value is UserEditField =>
	typeof value === "string" && USER_FIELDS.includes(value as UserEditField);

const toFieldErrors = (issues: readonly ApiIssue[] | undefined) => {
	if (!issues?.length) return undefined;

	const fieldErrors: Partial<Record<UserEditField, string>> = {};

	for (const issue of issues) {
		const candidate = issue.field ?? issue.path?.[0];

		if (isUserField(candidate) && !fieldErrors[candidate]) {
			fieldErrors[candidate] = issue.message ?? "Invalid value";
		}
	}

	return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
};

export const updateUserAction = async (
	_previousState: UpdateUserState,
	formData: FormData,
): Promise<UpdateUserState> => {
	const roleValue = formData.get("role");
	const statusValue = formData.get("status");
	const parsed = updateUserSchema.safeParse({
		userId: formData.get("userId"),
		name: formData.get("name"),
		email: formData.get("email"),
		...(typeof roleValue === "string" && roleValue.length > 0
			? { role: roleValue }
			: {}),
		...(typeof statusValue === "string" && statusValue.length > 0
			? { status: statusValue }
			: {}),
	});

	if (!parsed.success) {
		const fieldErrors: Partial<Record<UserEditField, string>> = {};

		for (const issue of parsed.error.issues) {
			const field = issue.path[0];

			if (isUserField(field) && !fieldErrors[field]) {
				fieldErrors[field] = issue.message;
			}
		}

		return {
			status: "error",
			message: "Please check the highlighted fields and try again.",
			fieldErrors,
		};
	}

	const { userId, ...payload } = parsed.data;
	const result = await mutateAdminApi<AdminUser>(
		`users/${encodeURIComponent(userId)}`,
		"PATCH",
		payload,
	);

	if (!result.ok) {
		return {
			status: "error",
			message: result.message,
			fieldErrors: toFieldErrors(result.issues),
		};
	}

	revalidatePath("/admin");
	revalidatePath("/admin/users");
	revalidatePath("/admin/reviewers");
	revalidatePath("/admin/submissions");
	revalidatePath("/admin/feedbacks");
	revalidatePath("/reviewer");
	revalidatePath("/reviewer/submissions");
	revalidatePath("/reviewer/reviews");
	revalidatePath("/me");
	revalidatePath("/me/submissions");
	revalidatePath("/me/feedback");

	return {
		status: "success",
		message: "User updated successfully.",
	};
};
