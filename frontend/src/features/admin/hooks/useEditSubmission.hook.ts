import { toast } from "@/components/ui/toast";
import type { CreateSubmissionField, CreateSubmissionState } from "@/features/submissions/types";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { updateSubmissionAction } from "../actions/updateSubmission.action";

const INITIAL_STATE: CreateSubmissionState = { status: "idle" };

export const useEditSubmission = () => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [showErrors, setShowErrors] = useState(false);
	const [state, formAction, isPending] = useActionState(
		updateSubmissionAction,
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
			title: "Submission updated",
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

	const fieldError = (field: CreateSubmissionField) =>
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
