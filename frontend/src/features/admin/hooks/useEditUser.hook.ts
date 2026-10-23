import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { updateUserAction } from "../actions/updateUser.action";
import type { UpdateUserState, UserEditField } from "../types";

const INITIAL_STATE: UpdateUserState = { status: "idle" };

export const useEditUser = () => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [showErrors, setShowErrors] = useState(false);
	const [state, formAction, isPending] = useActionState(
		updateUserAction,
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
			title: "User updated",
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

	const fieldError = (field: UserEditField) =>
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
