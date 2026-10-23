"use client";

import { TableActionButton } from "@/components/tables/TableAction";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import type { AdminFeedback } from "@/features/admin/types";
import { Pencil, Save } from "lucide-react";
import { useEditFeedback } from "../hooks/useEditFeedback.hook";

type EditFeedbackDialogProps = {
	feedback: AdminFeedback;
};

export const EditFeedbackDialog = ({ feedback }: EditFeedbackDialogProps) => {
	const {
		open,
		handleOpenChange,
		showErrors,
		state,
		formAction,
		isPending,
		fieldError,
	} = useEditFeedback();

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<TableActionButton
				label="Edit feedback"
				aria-expanded={open}
				aria-haspopup="dialog"
				onClick={() => handleOpenChange(true)}
			>
				<Pencil className="size-3.5" aria-hidden="true" />
			</TableActionButton>

			<DialogContent className="max-w-2xl">
				<DialogDismiss />

				<DialogHeader>
					<DialogTitle>Edit feedback</DialogTitle>
					<DialogDescription>
						{feedback.submission.projectName} ·{" "}
						{feedback.reviewer?.name ?? "Unknown reviewer"}
					</DialogDescription>
				</DialogHeader>

				<form
					key={`${feedback.id}-${feedback.updatedAt}-${open}`}
					action={formAction}
					className="grid gap-4"
				>
					<input type="hidden" name="feedbackId" value={feedback.id} />

					{showErrors && state.status === "error" && state.message ? (
						<p
							role="alert"
							className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
						>
							{state.message}
						</p>
					) : null}

					<div className="grid gap-1.5">
						<Label htmlFor={`admin-edit-feedback-${feedback.id}`}>
							Feedback
						</Label>
						<Textarea
							id={`admin-edit-feedback-${feedback.id}`}
							name="content"
							defaultValue={feedback.content}
							required
							minLength={3}
							maxLength={2000}
							disabled={isPending}
							aria-invalid={Boolean(fieldError("content"))}
							className="min-h-40"
						/>
						<p className="text-xs text-muted-foreground">
							This updates the feedback shown to the student and across the
							dashboard. Review status is not changed.
						</p>
						{fieldError("content") ? (
							<p className="text-xs text-destructive">
								{fieldError("content")}
							</p>
						) : null}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
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
									<Save aria-hidden="true" />
									Save changes
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
