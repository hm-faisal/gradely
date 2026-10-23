import { toast } from "@/components/ui/toast";
import { type ChangeEvent, useActionState, useEffect, useState } from "react";
import { createSubmissionAction } from "../actions/createSubmission.action";
import type {
	CreateSubmissionField,
	CreateSubmissionState,
} from "../types";

const INITIAL_STATE: CreateSubmissionState = { status: "idle" };

const INITIAL_VALUES = {
	projectName: "",
	repoUrl: "",
	liveLink: "",
	description: "",
};

type UseNewSubmissionOptions = {
	onCreated: () => void;
};

export const useNewSubmission = ({ onCreated }: UseNewSubmissionOptions) => {
	const [state, formAction, isPending] = useActionState(
		createSubmissionAction,
		INITIAL_STATE,
	);
	const [values, setValues] = useState(INITIAL_VALUES);

	useEffect(() => {
		if (state.status !== "success") return;

		toast.add({
			type: "success",
			title: "Submission created",
			description: state.message ?? "Your project is now waiting for review.",
		});
		onCreated();
	}, [state, onCreated]);

	const handleChange =
		(field: CreateSubmissionField) =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const value = event.target.value;
			setValues((previous) => ({ ...previous, [field]: value }));
		};

	const fieldError = (field: CreateSubmissionField) =>
		state.status === "error" ? state.fieldErrors?.[field] : undefined;

	return { state, formAction, isPending, values, handleChange, fieldError };
};
