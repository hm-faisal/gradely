"use server";

import { revalidatePath } from "next/cache";
import { updateUserRoleSchema } from "../schemas/updateUserRole.schema";
import type { AdminActionState, AdminUser } from "../types";
import { mutateAdminApi } from "./api";

export const updateUserRoleAction = async (
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> => {
  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Choose a valid role.",
    };
  }

  const result = await mutateAdminApi<AdminUser>(
    `users/${parsed.data.userId}/role`,
    "PATCH",
    { role: parsed.data.role },
  );

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/reviewers");

  return {
    status: "success",
    message: "User role updated successfully.",
  };
};
