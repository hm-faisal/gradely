"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth.constants";
import type { ApiEnvelope, ApiIssue } from "@/types/auth";
import { createSubmissionSchema } from "../schemas/createSubmission.schema";
import type {
  CreateSubmissionField,
  CreateSubmissionState,
  Submission,
} from "../types";

const FIELDS: CreateSubmissionField[] = [
  "projectName",
  "repoUrl",
  "liveLink",
  "description",
];

const isSubmissionField = (value: unknown): value is CreateSubmissionField =>
  typeof value === "string" && FIELDS.includes(value as CreateSubmissionField);

const toFieldErrors = (issues: readonly ApiIssue[] | undefined) => {
  if (!issues?.length) return undefined;

  const fieldErrors: Partial<Record<CreateSubmissionField, string>> = {};

  for (const issue of issues) {
    const candidate = issue.field ?? issue.path?.[0];

    if (isSubmissionField(candidate) && !fieldErrors[candidate]) {
      fieldErrors[candidate] = issue.message ?? "Invalid value";
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
};

export const createSubmissionAction = async (
  _previousState: CreateSubmissionState,
  formData: FormData,
): Promise<CreateSubmissionState> => {
  const parsed = createSubmissionSchema.safeParse({
    projectName: formData.get("projectName"),
    repoUrl: formData.get("repoUrl"),
    liveLink: formData.get("liveLink"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<CreateSubmissionField, string>> = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (isSubmissionField(field) && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!baseUrl || !token) {
    return {
      status: "error",
      message: "Your session has expired. Please sign in again.",
    };
  }

  try {
    const response = await fetch(`${baseUrl}/submissions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: `${ACCESS_TOKEN_COOKIE}=${token}`,
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    const payload = (await response.json()) as ApiEnvelope<Submission>;

    if (!response.ok || !payload.success) {
      return {
        status: "error",
        message:
          payload.error?.message ??
          payload.message ??
          "Unable to create your submission. Please try again.",
        fieldErrors: toFieldErrors(payload.error?.details?.issues),
      };
    }

    revalidatePath("/me");

    return {
      status: "success",
      message: "Submission created successfully.",
    };
  } catch (error) {
    console.error("[submissions] Unable to create submission", error);

    return {
      status: "error",
      message: "Unable to reach the server. Please try again.",
    };
  }
};
