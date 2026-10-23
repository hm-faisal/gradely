"use server";

import { revalidatePath } from "next/cache";
import { reviewSubmissionSchema } from "../schemas/reviewSubmission.schema";
import type { ReviewActionState, ReviewField } from "../types";
import { mutateReviewerApi } from "./api";

const REVIEW_FIELDS: ReviewField[] = ["status", "feedback"];

const isReviewField = (value: unknown): value is ReviewField =>
  typeof value === "string" && REVIEW_FIELDS.includes(value as ReviewField);

export const reviewSubmissionAction = async (
  _previousState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> => {
  const parsed = reviewSubmissionSchema.safeParse({
    submissionId: formData.get("submissionId"),
    status: formData.get("status"),
    feedback: formData.get("feedback") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<ReviewField, string>> = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (isReviewField(field) && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const isEdit = formData.get("intent") === "edit";
  const { submissionId, ...payload } = parsed.data;
  const result = await mutateReviewerApi(
    `submissions/${submissionId}/review`,
    "PATCH",
    payload,
  );

  if (!result.ok) {
    const fieldErrors: Partial<Record<ReviewField, string>> = {};

    for (const issue of result.issues ?? []) {
      const candidate = issue.field ?? issue.path?.[0];

      if (isReviewField(candidate) && !fieldErrors[candidate]) {
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

  revalidatePath("/reviewer");
  revalidatePath("/reviewer/submissions");
  revalidatePath("/reviewer/reviews");
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/feedbacks");
  revalidatePath("/me");
  revalidatePath("/me/submissions");
  revalidatePath("/me/feedback");

  return {
    status: "success",
    message: isEdit
      ? "Review updated successfully."
      : parsed.data.status === "APPROVED"
        ? "Submission approved successfully."
        : "Submission rejected with feedback.",
  };
};
