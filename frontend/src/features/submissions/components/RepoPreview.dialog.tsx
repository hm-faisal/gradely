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
import {
	CodeXml,
	ExternalLink,
	Loader2,
	MonitorOff,
	MonitorPlay,
	RefreshCw,
} from "lucide-react";
import { useRepoPreview } from "../hooks/useRepoPreview.hook";

type RepoPreviewDialogProps = {
	repoUrl: string;
	projectName?: string;
	iconOnly?: boolean;
};

export const RepoPreviewDialog = ({
	repoUrl,
	projectName,
	iconOnly = false,
}: RepoPreviewDialogProps) => {
	const {
		open,
		handleOpenChange,
		status,
		preview,
		errorMessage,
		iframeDocument,
		showLoading,
		description,
		repoReference,
		loadPreview,
	} = useRepoPreview(repoUrl);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{iconOnly ? (
				<TableActionButton
					label="Repo preview"
					aria-expanded={open}
					aria-haspopup="dialog"
					onClick={() => handleOpenChange(true)}
				>
					<MonitorPlay className="size-3.5" aria-hidden="true" />
				</TableActionButton>
			) : (
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="gap-1.5"
					onClick={() => handleOpenChange(true)}
				>
					<MonitorPlay className="size-3.5" aria-hidden="true" />
					Repo preview
				</Button>
			)}

			<DialogContent
				aria-busy={showLoading}
				className="max-h-[calc(100vh-2rem)] max-w-6xl overflow-y-auto"
			>
				<DialogDismiss />

				<DialogHeader>
					<DialogTitle>
						{projectName ? `${projectName} · Repo preview` : "Repo preview"}
					</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				{!repoReference ? (
					<div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 p-8 text-center">
						<span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
							<MonitorOff className="size-5" aria-hidden="true" />
						</span>
						<div className="space-y-1">
							<p className="font-medium">Preview unavailable</p>
							<p className="max-w-md text-sm text-muted-foreground">
								Repo preview supports public GitHub repository URLs. Open the
								repository directly to review the code.
							</p>
						</div>
						<a
							href={repoUrl}
							target="_blank"
							rel="noreferrer noopener"
							className={buttonVariants({
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
							})}
						>
							<CodeXml className="size-3.5" aria-hidden="true" />
							Open repository
							<ExternalLink className="size-3" aria-hidden="true" />
						</a>
					</div>
				) : status === "error" ? (
					<div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 p-8 text-center">
						<span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
							<MonitorOff className="size-5" aria-hidden="true" />
						</span>
						<div className="space-y-1">
							<p className="font-medium">Preview unavailable</p>
							<p className="max-w-md text-sm text-muted-foreground">
								{errorMessage}
							</p>
						</div>
						<div className="flex flex-wrap justify-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="gap-1.5"
								onClick={() => loadPreview(repoReference)}
							>
								<RefreshCw className="size-3.5" aria-hidden="true" />
								Try again
							</Button>
							<a
								href={repoUrl}
								target="_blank"
								rel="noreferrer noopener"
								className={buttonVariants({
									variant: "outline",
									size: "sm",
									className: "gap-1.5",
								})}
							>
								<CodeXml className="size-3.5" aria-hidden="true" />
								Open repository
								<ExternalLink className="size-3" aria-hidden="true" />
							</a>
						</div>
					</div>
				) : showLoading ? (
					<div
						className="flex min-h-[min(60vh,40rem)] flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 p-8 text-center"
						aria-live="polite"
					>
						<Loader2
							className="size-6 animate-spin text-muted-foreground"
							aria-hidden="true"
						/>
						<div className="space-y-1">
							<p className="font-medium">Loading repository</p>
							<p className="text-sm text-muted-foreground">
								Fetching repository details and README from GitHub…
							</p>
						</div>
					</div>
				) : preview ? (
					<div className="overflow-hidden rounded-lg border bg-background">
						<iframe
							srcDoc={iframeDocument}
							title={`${projectName ?? preview.repo.full_name} GitHub preview`}
							className="h-[min(60vh,40rem)] min-h-[24rem] w-full border-0 bg-background"
							sandbox="allow-popups allow-popups-to-escape-sandbox"
							referrerPolicy="no-referrer"
							loading="eager"
						/>
					</div>
				) : null}

				<DialogFooter>
					{repoReference ? (
						<a
							href={preview?.repo.html_url ?? repoUrl}
							target="_blank"
							rel="noreferrer noopener"
							className={buttonVariants({
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
							})}
						>
							<CodeXml className="size-3.5" aria-hidden="true" />
							Open on GitHub
							<ExternalLink className="size-3" aria-hidden="true" />
						</a>
					) : null}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => handleOpenChange(false)}
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
