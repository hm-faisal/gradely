"use client";

import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAutoAssignReviewers } from "../hooks/useAutoAssignReviewers.hook";

type AutoAssignReviewersButtonProps = {
  unassignedCount: number;
  reviewerCount: number;
};

export const AutoAssignReviewersButton = ({
  unassignedCount,
  reviewerCount,
}: AutoAssignReviewersButtonProps) => {
  const { isPending, disabled, handleAutoAssign } = useAutoAssignReviewers({
    unassignedCount,
    reviewerCount,
  });

  return (
    <Button
      type="button"
      size="sm"
      className="gap-1.5"
      onClick={handleAutoAssign}
      disabled={disabled}
      title={
        reviewerCount === 0
          ? "Add an active reviewer before auto-assigning"
          : unassignedCount === 0
            ? "Every pending submission already has a reviewer"
            : "Randomly assign reviewers with balanced workloads"
      }
    >
      {isPending ? (
        <Spinner />
      ) : (
        <Shuffle className="size-3.5" aria-hidden="true" />
      )}
      {isPending
        ? "Assigning…"
        : `Auto assign${unassignedCount > 0 ? ` (${unassignedCount})` : ""}`}
    </Button>
  );
};
