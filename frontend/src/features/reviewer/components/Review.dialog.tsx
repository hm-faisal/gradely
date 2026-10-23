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
import { RepoPreviewDialog } from "@/features/submissions/components/RepoPreview.dialog";
import type { Submission } from "@/features/submissions/types";
import { formatDate } from "@/utils/utils";
import {
	CalendarDays,
	CheckCircle2,
	ClipboardCheck,
	CodeXml,
	ExternalLink,
	Globe,
	Pencil,
	UserRound,
} from "lucide-react";
import { useReviewSubmission } from "../hooks/useReviewSubmission.hook";

const ResourceLink = ({
	href,
	label,
	icon: Icon,
}: {
	href: string;
	label: string;
	icon: typeof Globe;
}) => (
	<a
		href={href}
		target="_blank"
		rel="noreferrer noopener"
		className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
	>
		<Icon className="size-3.5" aria-hidden="true" />
		{label}
		<ExternalLink className="size-3" aria-hidden="true" />
	</a>
);

type ReviewDialogProps = {
	submission: Submission;
	mode?: "create" | "edit";
	iconOnly?: boolean;
};

export const ReviewDialog = ({
	submission,
	mode = "create",
	iconOnly = false,
}: ReviewDialogProps) => {
	const { open, setOpen, state, formAction, isPending, isEdit, fieldError } =
		useReviewSubmission(mode);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{iconOnly ? (
				<TableActionButton
					label={isEdit ? "Edit review" : "Review submission"}
					variant={isEdit ? "outline" : "default"}
					aria-expanded={open}
					aria-haspopup="dialog"
					onClick={() => setOpen(true)}
				>
					{isEdit ? (
						<Pencil className="size-3.5" aria-hidden="true" />
					) : (
						<CheckCircle2 className="size-3.5" aria-hidden="true" />
					)}
				</TableActionButton>
			) : (
				<Button
					type="button"
					size="sm"
					variant={isEdit ? "outline" : "default"}
					className="gap-1.5"
					onClick={() => setOpen(true)}
				>
					{isEdit ? (
						<Pencil className="size-3.5" aria-hidden="true" />
					) : (
						<CheckCircle2 className="size-3.5" aria-hidden="true" />
					)}
					{isEdit ? "Edit review" : "Review"}
				</Button>
			)}

			<DialogContent className="max-w-2xl">
				<DialogDismiss />

				<DialogHeader>
					<DialogTitle>{submission.projectName}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Editing review"
							: `Submitted ${formatDate(submission.createdAt)}`}{" "}
						· {submission.student?.name ?? "Unknown student"}
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-muted/30 p-3">
					<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
						<UserRound className="size-3.5" aria-hidden="true" />
						{submission.student?.email ?? "No email available"}
					</span>
					<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
						<CalendarDays className="size-3.5" aria-hidden="true" />
						{isEdit
							? `Reviewed ${formatDate(submission.reviewedAt)}`
							: "Needs review"}
					</span>
					<ResourceLink
						href={submission.liveLink}
						label="Live demo"
						icon={Globe}
					/>
					<ResourceLink
						href={submission.repoUrl}
						label="Repository"
						icon={CodeXml}
					/>
					<RepoPreviewDialog
						repoUrl={submission.repoUrl}
						projectName={submission.projectName}
					/>
				</div>

				<div className="space-y-1.5">
					<p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
						Description
					</p>
					<p className="max-h-40 overflow-y-auto text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
						{submission.description}
					</p>
				</div>

				<form
					key={submission.updatedAt}
					action={formAction}
					className="grid gap-4 border-t pt-4"
				>
					<input type="hidden" name="submissionId" value={submission.id} />
					<input type="hidden" name="intent" value={mode} />

					{state.status === "error" && state.message ? (
						<p
							role="alert"
							className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
						>
							{state.message}
						</p>
					) : null}

					<div className="grid gap-1.5">
						<Label htmlFor={`review-status-${submission.id}`}>Decision</Label>
						<select
							id={`review-status-${submission.id}`}
							name="status"
							defaultValue={
								isEdit &&
								(submission.status === "APPROVED" ||
									submission.status === "REJECTED")
									? submission.status
									: "APPROVED"
							}
							disabled={isPending}
							aria-invalid={Boolean(fieldError("status"))}
							className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
						>
							<option value="APPROVED">Approve submission</option>
							<option value="REJECTED">Reject submission</option>
						</select>
						{fieldError("status") ? (
							<p className="text-xs text-destructive">{fieldError("status")}</p>
						) : null}
					</div>

					<div className="grid gap-1.5">
						<Label htmlFor={`review-feedback-${submission.id}`}>Feedback</Label>
						<Textarea
							id={`review-feedback-${submission.id}`}
							name="feedback"
							rows={5}
							maxLength={2000}
							defaultValue={isEdit ? (submission.feedback ?? "") : undefined}
							placeholder="Share what works well and what could be improved…"
							disabled={isPending}
							aria-invalid={Boolean(fieldError("feedback"))}
						/>
						{fieldError("feedback") ? (
							<p className="text-xs text-destructive">
								{fieldError("feedback")}
							</p>
						) : (
							<p className="text-xs text-muted-foreground">
								{isEdit
									? "Changes update the feedback visible to the student and admins. Feedback is required when rejecting."
									: "Feedback is required when rejecting a submission. Visible to the student and admins."}
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
									{isEdit ? "Updating…" : "Submitting…"}
								</>
							) : (
								<>
									{isEdit ? (
										<Pencil className="size-3.5" aria-hidden="true" />
									) : (
										<ClipboardCheck className="size-3.5" aria-hidden="true" />
									)}
									{isEdit ? "Update review" : "Submit review"}
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
