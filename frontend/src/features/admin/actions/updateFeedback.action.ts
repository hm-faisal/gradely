"use server";

import { revalidatePath } from "next/cache";
import type { ApiIssue } from "@/types/auth";
import { updateFeedbackSchema } from "../schemas/updateFeedback.schema";
import type {
  AdminFeedback,
  FeedbackEditField,
  UpdateFeedbackState,
} from "../types";
import { mutateAdminApi } from "./api";

const FEEDBACK_FIELDS: FeedbackEditField[] = ["content"];

const isFeedbackField = (value: unknown): value is FeedbackEditField =>
  typeof value === "string" &&
  FEEDBACK_FIELDS.includes(value as FeedbackEditField);

const toFieldErrors = (issues: readonly ApiIssue[] | undefined) => {
  if (!issues?.length) return undefined;

  const fieldErrors: Partial<Record<FeedbackEditField, string>> = {};

  for (const issue of issues) {
    const candidate = issue.field ?? issue.path?.[0];

    if (isFeedbackField(candidate) && !fieldErrors[candidate]) {
      fieldErrors[candidate] = issue.message ?? "Invalid value";
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
};

export const updateFeedbackAction = async (
  _previousState: UpdateFeedbackState,
  formData: FormData,
): Promise<UpdateFeedbackState> => {
  const parsed = updateFeedbackSchema.safeParse({
    feedbackId: formData.get("feedbackId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        "Please check the feedback and try again.",
      fieldErrors: {
        content: parsed.error.issues.find(
          (issue) => issue.path[0] === "content",
        )?.message,
      },
    };
  }

  const { feedbackId, content } = parsed.data;
  const result = await mutateAdminApi<AdminFeedback>(
    `feedbacks/${encodeURIComponent(feedbackId)}`,
    "PATCH",
    { content },
  );

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: toFieldErrors(result.issues),
    };
  }

  revalidatePath("/admin/feedbacks");
  revalidatePath(`/admin/feedbacks/${feedbackId}`);
  revalidatePath("/admin/submissions");
  revalidatePath("/reviewer/submissions");
  revalidatePath("/reviewer/reviews");
  revalidatePath("/me");
  revalidatePath("/me/submissions");
  revalidatePath("/me/feedback");

  return {
    status: "success",
    message: "Feedback updated successfully.",
  };
};
