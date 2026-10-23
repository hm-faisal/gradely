import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { updateFeedbackAction } from "../actions/updateFeedback.action";
import type { FeedbackEditField, UpdateFeedbackState } from "../types";

const INITIAL_STATE: UpdateFeedbackState = { status: "idle" };

export const useEditFeedback = () => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [showErrors, setShowErrors] = useState(false);
	const [state, formAction, isPending] = useActionState(
		updateFeedbackAction,
		INITIAL_STATE,
	);

	useEffect(() => {
		if (state.status === "error") {
			setShowErrors(true);
			return;
		}

		if (state.status !== "success") return;

		toast.add({
			type: "success",
			title: "Feedback updated",
			description: state.message,
		});
		setOpen(false);
		router.refresh();
	}, [state, router]);

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);

		if (nextOpen) {
			setShowErrors(false);
		}
	};

	const fieldError = (field: FeedbackEditField) =>
		showErrors && state.status === "error"
			? state.fieldErrors?.[field]
			: undefined;

	return {
		open,
		handleOpenChange,
		showErrors,
		state,
		formAction,
		isPending,
		fieldError,
	};
};
