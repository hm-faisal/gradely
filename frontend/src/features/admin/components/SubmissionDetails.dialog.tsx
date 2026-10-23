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
import type { AdminSubmission } from "@/features/admin/types";
import { RepoPreviewDialog } from "@/features/submissions/components/RepoPreview.dialog";
import { StatusBadge } from "@/features/submissions/components/Status.badge";
import { formatDate } from "@/utils/utils";
import {
	CalendarDays,
	CodeXml,
	ExternalLink,
	Eye,
	Globe,
	ShieldCheck,
	UserRound,
} from "lucide-react";
import { useSubmissionDetails } from "../hooks/useSubmissionDetails.hook";

type SubmissionDetailsDialogProps = {
	submission: AdminSubmission;
};

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
		className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
	>
		<Icon className="size-4" aria-hidden="true" />
		{label}
		<ExternalLink className="size-3.5" aria-hidden="true" />
	</a>
);

export const SubmissionDetailsDialog = ({
	submission,
}: SubmissionDetailsDialogProps) => {
	const { open, setOpen } = useSubmissionDetails();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<TableActionButton
				label="View details"
				aria-expanded={open}
				aria-haspopup="dialog"
				onClick={() => setOpen(true)}
			>
				<Eye className="size-3.5" aria-hidden="true" />
			</TableActionButton>

			<DialogContent className="max-w-2xl">
				<DialogDismiss />

				<DialogHeader>
					<DialogTitle>{submission.projectName}</DialogTitle>
					<DialogDescription>
						Submitted {formatDate(submission.createdAt)} ·{" "}
						{submission.student?.name ?? "Unknown student"}
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-wrap items-center gap-2">
					<StatusBadge status={submission.status} />
					{submission.reviewedAt ? (
						<span className="text-xs text-muted-foreground">
							Reviewed {formatDate(submission.reviewedAt)}
						</span>
					) : null}
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="rounded-lg border bg-muted/30 p-3">
						<p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
							Student
						</p>
						<p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
							<UserRound className="size-3.5" aria-hidden="true" />
							{submission.student?.name ?? "Unknown"}
						</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							{submission.student?.email ?? "No email available"}
						</p>
					</div>

					<div className="rounded-lg border bg-muted/30 p-3">
						<p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
							Assigned reviewer
						</p>
						<p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
							<ShieldCheck className="size-3.5" aria-hidden="true" />
							{submission.reviewer?.name ?? "No reviewer assigned"}
						</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							{submission.reviewer?.email ??
								"Waiting for an administrator to assign a reviewer"}
						</p>
					</div>
				</div>

				<div className="space-y-1.5">
					<p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
						Description
					</p>
					<p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
						{submission.description}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-4 border-t pt-4">
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
					<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
						<CalendarDays className="size-3.5" aria-hidden="true" />
						Updated {formatDate(submission.updatedAt)}
					</span>
				</div>

				{submission.feedback ? (
					<div className="space-y-1.5">
						<p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
							Feedback
						</p>
						<blockquote className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-line">
							{submission.feedback}
						</blockquote>
					</div>
				) : null}

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
