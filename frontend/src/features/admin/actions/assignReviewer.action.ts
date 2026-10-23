"use server";

import { revalidatePath } from "next/cache";
import { assignReviewerSchema } from "../schemas/assignReviewer.schema";
import type { AssignReviewerActionState } from "../types";
import { mutateAdminApi } from "./api";

export const assignReviewerAction = async (
  _previousState: AssignReviewerActionState,
  formData: FormData,
): Promise<AssignReviewerActionState> => {
  const parsed = assignReviewerSchema.safeParse({
    submissionId: formData.get("submissionId"),
    reviewerId: formData.get("reviewerId"),
  });

  if (!parsed.success) {
    const reviewerIssue = parsed.error.issues.find(
      (issue) => issue.path[0] === "reviewerId",
    );

    return {
      status: "error",
      message: "Please choose a reviewer and try again.",
      fieldErrors: reviewerIssue
        ? { reviewerId: reviewerIssue.message }
        : undefined,
    };
  }

  const { submissionId, reviewerId } = parsed.data;
  const result = await mutateAdminApi<unknown>(
    `submissions/${submissionId}/assign`,
    "PATCH",
    { reviewerId },
  );

  if (!result.ok) {
    const reviewerIssue = (result.issues ?? []).find((issue) => {
      const field = issue.field ?? issue.path?.[0];
      return field === "reviewerId";
    });

    return {
      status: "error",
      message: result.message,
      fieldErrors: reviewerIssue
        ? { reviewerId: reviewerIssue.message ?? "Choose a valid reviewer" }
        : undefined,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/reviewers");
  revalidatePath("/reviewer");
  revalidatePath("/reviewer/submissions");

  return {
    status: "success",
    message: "Reviewer assigned successfully.",
  };
};
