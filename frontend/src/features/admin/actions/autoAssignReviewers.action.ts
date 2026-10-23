"use server";

import { revalidatePath } from "next/cache";
import type { AssignReviewerActionState, AutoAssignResult } from "../types";
import { mutateAdminApi } from "./api";

export const autoAssignReviewersAction =
  async (): Promise<AssignReviewerActionState> => {
    const result = await mutateAdminApi<AutoAssignResult>(
      "submissions/auto-assign",
      "POST",
    );

    if (!result.ok) {
      return { status: "error", message: result.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/submissions");
    revalidatePath("/admin/reviewers");
    revalidatePath("/reviewer");
    revalidatePath("/reviewer/submissions");

    return {
      status: "success",
      message:
        result.data.assigned > 0
          ? `Assigned ${result.data.assigned} submission${
              result.data.assigned === 1 ? "" : "s"
            } to reviewers.`
          : "Every pending submission already has a reviewer.",
    };
  };
