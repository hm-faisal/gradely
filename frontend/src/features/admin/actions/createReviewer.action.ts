"use server";

import { revalidatePath } from "next/cache";
import { createReviewerSchema } from "../schemas/createReviewer.schema";
import type { AdminActionState, ReviewerField } from "../types";
import { mutateAdminApi } from "./api";

const REVIEWER_FIELDS: ReviewerField[] = ["name", "email", "password"];

const isReviewerField = (value: unknown): value is ReviewerField =>
  typeof value === "string" && REVIEWER_FIELDS.includes(value as ReviewerField);

export const createReviewerAction = async (
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> => {
  const parsed = createReviewerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<ReviewerField, string>> = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (isReviewerField(field) && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const result = await mutateAdminApi("users/reviewers", "POST", parsed.data);

  if (!result.ok) {
    const fieldErrors: Partial<Record<ReviewerField, string>> = {};

    for (const issue of result.issues ?? []) {
      const candidate = issue.field ?? issue.path?.[0];

      if (isReviewerField(candidate) && !fieldErrors[candidate]) {
        fieldErrors[candidate] = issue.message ?? "Invalid value";
      }
    }

    return {
      status: "error",
      message: result.message,
      fieldErrors:
        Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/reviewers");

  return {
    status: "success",
    message: "Reviewer account created successfully.",
  };
};
