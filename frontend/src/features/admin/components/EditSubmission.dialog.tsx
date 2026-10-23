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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { AdminSubmission } from "@/features/admin/types";
import type { CreateSubmissionField } from "@/features/submissions/types";
import { Pencil, Save } from "lucide-react";
import { useEditSubmission } from "../hooks/useEditSubmission.hook";

const FIELD_IDS: Record<CreateSubmissionField, string> = {
	projectName: "admin-edit-project-name",
	repoUrl: "admin-edit-repo-url",
	liveLink: "admin-edit-live-link",
	description: "admin-edit-description",
};

type EditSubmissionDialogProps = {
	submission: AdminSubmission;
};

export const EditSubmissionDialog = ({
	submission,
}: EditSubmissionDialogProps) => {
	const {
		open,
		handleOpenChange,
		showErrors,
		state,
		formAction,
		isPending,
		fieldError,
	} = useEditSubmission();
	const isReviewed = submission.status !== "PENDING";
	const fieldId = (field: CreateSubmissionField) =>
		`${FIELD_IDS[field]}-${submission.id}`;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<TableActionButton
				label="Edit submission"
				aria-expanded={open}
				aria-haspopup="dialog"
				onClick={() => handleOpenChange(true)}
			>
				<Pencil className="size-3.5" aria-hidden="true" />
			</TableActionButton>

			<DialogContent className="max-w-2xl">
				<DialogDismiss />

				<DialogHeader>
					<DialogTitle>Edit submission</DialogTitle>
					<DialogDescription>
						{submission.projectName} ·{" "}
						{submission.student?.name ?? "Unknown student"}
					</DialogDescription>
				</DialogHeader>

				{isReviewed ? (
					<div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
						This submission has already been reviewed. Updating its information
						will not reset its status or feedback.
					</div>
				) : null}

				<form
					key={`${submission.id}-${submission.updatedAt}-${open}`}
					action={formAction}
					className="grid gap-4"
				>
					<input type="hidden" name="submissionId" value={submission.id} />

					{showErrors && state.status === "error" && state.message ? (
						<p
							role="alert"
							className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
						>
							{state.message}
						</p>
					) : null}

					<div className="grid gap-1.5">
						<Label htmlFor={fieldId("projectName")}>Project name</Label>
						<Input
							id={fieldId("projectName")}
							name="projectName"
							defaultValue={submission.projectName}
							placeholder="Portfolio website"
							autoComplete="off"
							required
							minLength={3}
							maxLength={255}
							disabled={isPending}
							aria-invalid={Boolean(fieldError("projectName"))}
						/>
						{fieldError("projectName") ? (
							<p className="text-xs text-destructive">
								{fieldError("projectName")}
							</p>
						) : null}
					</div>

					<div className="grid items-start gap-4 sm:grid-cols-2">
						<div className="grid gap-1.5">
							<Label htmlFor={fieldId("repoUrl")}>Repository URL</Label>
							<Input
								id={fieldId("repoUrl")}
								name="repoUrl"
								type="url"
								defaultValue={submission.repoUrl}
								placeholder="https://github.com/you/project"
								required
								maxLength={2048}
								disabled={isPending}
								aria-invalid={Boolean(fieldError("repoUrl"))}
							/>
							{fieldError("repoUrl") ? (
								<p className="text-xs text-destructive">
									{fieldError("repoUrl")}
								</p>
							) : null}
						</div>

						<div className="grid gap-1.5">
							<Label htmlFor={fieldId("liveLink")}>Live link</Label>
							<Input
								id={fieldId("liveLink")}
								name="liveLink"
								type="url"
								defaultValue={submission.liveLink}
								placeholder="https://your-project.com"
								required
								maxLength={2048}
								disabled={isPending}
								aria-invalid={Boolean(fieldError("liveLink"))}
							/>
							{fieldError("liveLink") ? (
								<p className="text-xs text-destructive">
									{fieldError("liveLink")}
								</p>
							) : null}
						</div>
					</div>

					<div className="grid gap-1.5">
						<Label htmlFor={fieldId("description")}>Description</Label>
						<Textarea
							id={fieldId("description")}
							name="description"
							defaultValue={submission.description}
							placeholder="What did the student build, and what should the reviewer know?"
							required
							minLength={10}
							maxLength={5000}
							disabled={isPending}
							aria-invalid={Boolean(fieldError("description"))}
						/>
						{fieldError("description") ? (
							<p className="text-xs text-destructive">
								{fieldError("description")}
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
