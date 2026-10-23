import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { reviewSubmissionAction } from "../actions/reviewSubmission.action";
import type { ReviewActionState, ReviewField } from "../types";

const INITIAL_STATE: ReviewActionState = { status: "idle" };

type ReviewMode = "create" | "edit";

export const useReviewSubmission = (mode: ReviewMode = "create") => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [state, formAction, isPending] = useActionState(
		reviewSubmissionAction,
		INITIAL_STATE,
	);
	const isEdit = mode === "edit";

	useEffect(() => {
		if (state.status !== "success") return;

		toast.add({
			type: "success",
			title: isEdit ? "Review updated" : "Review submitted",
			description: state.message,
		});
		setOpen(false);
		router.refresh();
	}, [state, router, isEdit]);

	const fieldError = (field: ReviewField) =>
		state.status === "error" ? state.fieldErrors?.[field] : undefined;

	return { open, setOpen, state, formAction, isPending, isEdit, fieldError };
};
