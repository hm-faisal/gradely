import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { autoAssignReviewersAction } from "../actions/autoAssignReviewers.action";

type UseAutoAssignReviewersOptions = {
	unassignedCount: number;
	reviewerCount: number;
};

export const useAutoAssignReviewers = ({
	unassignedCount,
	reviewerCount,
}: UseAutoAssignReviewersOptions) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const disabled = isPending || unassignedCount === 0 || reviewerCount === 0;

	const handleAutoAssign = () => {
		startTransition(async () => {
			const result = await autoAssignReviewersAction();

			if (result.status === "error") {
				toast.add({
					type: "error",
					title: "Could not auto-assign reviewers",
					description: result.message,
				});
				return;
			}

			toast.add({
				type: "success",
				title: "Reviewers assigned",
				description: result.message,
			});
			router.refresh();
		});
	};

	return { isPending, disabled, handleAutoAssign };
};
