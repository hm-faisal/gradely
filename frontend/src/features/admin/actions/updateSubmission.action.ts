"use server";

import type {
	CreateSubmissionField,
	CreateSubmissionState,
	Submission,
} from "@/features/submissions/types";
import type { ApiIssue } from "@/types/auth";
import { revalidatePath } from "next/cache";
import { updateSubmissionSchema } from "../schemas/updateSubmission.schema";
import { mutateAdminApi } from "./api";

const SUBMISSION_FIELDS: CreateSubmissionField[] = [
	"projectName",
	"repoUrl",
	"liveLink",
	"description",
];

const isSubmissionField = (value: unknown): value is CreateSubmissionField =>
	typeof value === "string" &&
	SUBMISSION_FIELDS.includes(value as CreateSubmissionField);

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

export const updateSubmissionAction = async (
	_previousState: CreateSubmissionState,
	formData: FormData,
): Promise<CreateSubmissionState> => {
	const parsed = updateSubmissionSchema.safeParse({
		submissionId: formData.get("submissionId"),
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

	const { submissionId, ...payload } = parsed.data;
	const result = await mutateAdminApi<Submission>(
		`submissions/${encodeURIComponent(submissionId)}`,
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
	revalidatePath("/admin/submissions");
	revalidatePath("/admin/feedbacks");
	revalidatePath("/reviewer/submissions");
	revalidatePath("/reviewer/reviews");
	revalidatePath("/me/submissions");
	revalidatePath("/me/feedback");

	return {
		status: "success",
		message: "Submission updated successfully.",
	};
};
