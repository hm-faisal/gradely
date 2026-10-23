import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { updateUserRoleAction } from "../actions/updateUserRole.action";
import type { AdminActionState } from "../types";

const INITIAL_STATE: AdminActionState = { status: "idle" };

export const useUserDetails = () => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [state, formAction, isPending] = useActionState(
		updateUserRoleAction,
		INITIAL_STATE,
	);

	useEffect(() => {
		if (state.status !== "success") return;

		toast.add({
			type: "success",
			title: "Role updated",
			description: state.message,
		});
		setOpen(false);
		router.refresh();
	}, [state, router]);

	return { open, setOpen, state, formAction, isPending };
};
