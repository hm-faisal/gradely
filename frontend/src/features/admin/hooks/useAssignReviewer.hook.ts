import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { assignReviewerAction } from "../actions/assignReviewer.action";
import type { AssignReviewerActionState } from "../types";

const INITIAL_STATE: AssignReviewerActionState = { status: "idle" };

export const useAssignReviewer = () => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [state, formAction, isPending] = useActionState(
		assignReviewerAction,
		INITIAL_STATE,
	);

	useEffect(() => {
		if (state.status !== "success") return;

		toast.add({
			type: "success",
			title: "Reviewer assigned",
			description: state.message,
		});
		setOpen(false);
		router.refresh();
	}, [state, router]);

	return { open, setOpen, state, formAction, isPending };
};
