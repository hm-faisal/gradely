import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { createReviewerAction } from "../actions/createReviewer.action";
import type { AdminActionState, ReviewerField } from "../types";

const INITIAL_STATE: AdminActionState = { status: "idle" };

export const useNewReviewer = () => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [state, formAction, isPending] = useActionState(
		createReviewerAction,
		INITIAL_STATE,
	);

	useEffect(() => {
		if (state.status !== "success") return;

		toast.add({
			type: "success",
			title: "Reviewer added",
			description: state.message,
		});
		setOpen(false);
		router.refresh();
	}, [state, router]);

	const fieldError = (field: ReviewerField) =>
		state.status === "error" ? state.fieldErrors?.[field] : undefined;

	return { open, setOpen, state, formAction, isPending, fieldError };
};
