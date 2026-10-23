"use client";

import { TableActionButton } from "@/components/tables/TableAction";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogDismiss,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { AdminUser } from "@/features/admin/types";
import type { Submission } from "@/features/submissions/types";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useAssignReviewer } from "../hooks/useAssignReviewer.hook";

type AssignReviewerDialogProps = {
	submission: Submission;
	reviewers: AdminUser[];
};

export const AssignReviewerDialog = ({
	submission,
	reviewers,
}: AssignReviewerDialogProps) => {
	const { open, setOpen, state, formAction, isPending } = useAssignReviewer();

	const isAssigned = Boolean(submission.reviewerId);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<TableActionButton
				label={isAssigned ? "Reassign reviewer" : "Assign reviewer"}
				aria-expanded={open}
				aria-haspopup="dialog"
				onClick={() => setOpen(true)}
			>
				<UserPlus className="size-3.5" aria-hidden="true" />
			</TableActionButton>

			<DialogContent>
				<DialogDismiss />

				<DialogHeader>
					<DialogTitle>Assign a reviewer</DialogTitle>
					<DialogDescription>{submission.projectName}</DialogDescription>
				</DialogHeader>

				<div className="rounded-lg border bg-muted/30 p-3 text-sm">
					<p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
						Current assignment
					</p>
					<p className="mt-1 font-medium">
						{submission.reviewer?.name ?? "No reviewer assigned"}
					</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{submission.reviewer?.email ??
							"Choose a reviewer to put this submission into their queue."}
					</p>
				</div>

				{reviewers.length === 0 ? (
					<div className="space-y-3 rounded-lg border border-dashed p-4 text-sm">
						<p className="font-medium">No active reviewers available</p>
						<p className="text-muted-foreground">
							Add a reviewer account before assigning submissions.
						</p>
						<Link
							href="/admin/reviewers"
							className={buttonVariants({ size: "sm" })}
							onClick={() => setOpen(false)}
						>
							Add reviewer
						</Link>
					</div>
				) : (
					<form action={formAction} className="grid gap-4">
						<input type="hidden" name="submissionId" value={submission.id} />

						{state.status === "error" && state.message ? (
							<p
								role="alert"
								className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
							>
								{state.message}
							</p>
						) : null}

						<div className="grid gap-1.5">
							<Label htmlFor={`assign-reviewer-${submission.id}`}>
								Reviewer
							</Label>
							<select
								id={`assign-reviewer-${submission.id}`}
								name="reviewerId"
								defaultValue={submission.reviewerId ?? ""}
								disabled={isPending}
								aria-invalid={Boolean(state.fieldErrors?.reviewerId)}
								className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
							>
								<option value="">Choose a reviewer</option>
								{reviewers.map((reviewer) => (
									<option key={reviewer.id} value={reviewer.id}>
										{reviewer.name} ({reviewer.email})
									</option>
								))}
							</select>
							{state.fieldErrors?.reviewerId ? (
								<p className="text-xs text-destructive">
									{state.fieldErrors.reviewerId}
								</p>
							) : (
								<p className="text-xs text-muted-foreground">
									The reviewer will see this submission in their assigned queue.
								</p>
							)}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? (
									<>
										<Spinner />
										Saving…
									</>
								) : (
									<>
										<UserPlus aria-hidden="true" />
										{isAssigned ? "Update assignment" : "Assign reviewer"}
									</>
								)}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
};
