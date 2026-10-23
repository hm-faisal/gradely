import { Pagination } from "@/components/tables/Pagination";
import { TableControls } from "@/components/tables/TableControls";
import { Card, CardContent } from "@/components/ui/card";
import { getMyAssignedSubmissions } from "@/features/reviewer/apis";
import { ReviewDialog } from "@/features/reviewer/components/Review.dialog";
import { getCurrentUser } from "@/features/submissions/apis";
import { RepoPreviewDialog } from "@/features/submissions/components/RepoPreview.dialog";
import type { Submission } from "@/features/submissions/types";
import {
	buildOffsetHref,
	emptyPaginatedResult,
	parseLimitParam,
	parseOffsetParam,
	parseSearchParam,
} from "@/utils/pagination";
import { formatDate, getInitials, truncate } from "@/utils/utils";
import { ClipboardCheck, CodeXml, ExternalLink, Globe } from "lucide-react";

export const instant = false;

type PendingReviewsPageProps = {
	searchParams: Promise<{
		offset?: string | string[];
		limit?: string | string[];
		search?: string | string[];
		searchParam?: string | string[];
	}>;
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
		className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
	>
		<Icon className="size-3.5" aria-hidden="true" />
		{label}
		<ExternalLink className="size-3" aria-hidden="true" />
	</a>
);

const PendingReviewsPage = async ({
	searchParams,
}: PendingReviewsPageProps) => {
	const params = await searchParams;
	const offset = parseOffsetParam(params.offset);
	const limit = parseLimitParam(params.limit);
	const search = parseSearchParam(params.searchParam ?? params.search);

	const user = await getCurrentUser();
	const submissionsPage = user
		? await getMyAssignedSubmissions(user.id, offset, limit, search)
		: emptyPaginatedResult<Submission>(offset, limit);
	const { items: submissions, meta } = submissionsPage;
	const newestFirst = [...submissions].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	const pageHref = (nextOffset: number) =>
		buildOffsetHref("/reviewer/submissions", { limit, search }, nextOffset);

	return (
		<section
			aria-labelledby="reviewer-pending-heading"
			className="flex flex-col gap-4"
		>
			<div>
				<h2
					id="reviewer-pending-heading"
					className="flex items-center gap-2 text-xl font-semibold tracking-tight"
				>
					Pending reviews
					<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
						{meta.total}
					</span>
				</h2>
				<p className="text-sm text-muted-foreground">
					Submissions assigned to you by an administrator. Every decision is
					recorded with your feedback.
				</p>
			</div>

			<TableControls
				pathname="/reviewer/submissions"
				currentSearch={search}
				currentLimit={limit}
				searchPlaceholder="Search submissions by project name…"
			/>

			<Card>
				{newestFirst.length === 0 ? (
					<CardContent className="items-center py-14 text-center">
						<span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
							<ClipboardCheck className="size-5" aria-hidden="true" />
						</span>
						<div className="space-y-1">
							<p className="font-medium">Nothing assigned right now</p>
							<p className="max-w-sm text-sm text-muted-foreground">
								New submissions assigned to you will appear here. Check back
								later.
							</p>
						</div>
					</CardContent>
				) : (
					<CardContent className="px-0">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[900px] border-collapse text-sm">
								<thead>
									<tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
										<th scope="col" className="px-4 py-2.5 font-medium">
											Project
										</th>
										<th scope="col" className="px-4 py-2.5 font-medium">
											Student
										</th>
										<th scope="col" className="px-4 py-2.5 font-medium">
											Submitted
										</th>
										<th scope="col" className="px-4 py-2.5 font-medium">
											Links
										</th>
										<th
											scope="col"
											className="px-4 py-2.5 text-right font-medium"
										>
											Review
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{newestFirst.map((submission) => (
										<tr
											key={submission.id}
											className="transition-colors hover:bg-muted/40"
										>
											<td className="max-w-[320px] px-4 py-3 align-top">
												<p className="truncate font-medium">
													{submission.projectName}
												</p>
												<p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
													{truncate(submission.description, 120)}
												</p>
											</td>
											<td className="px-4 py-3 align-top">
												<div className="flex items-center gap-2.5">
													<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
														{getInitials(
															submission.student?.name ?? "Student",
															submission.student?.email,
														)}
													</span>
													<div className="min-w-0">
														<p className="truncate text-sm font-medium">
															{submission.student?.name ?? "Unknown student"}
														</p>
														<p className="truncate text-xs text-muted-foreground">
															{submission.student?.email ?? "—"}
														</p>
													</div>
												</div>
											</td>
											<td className="px-4 py-3 align-top text-xs whitespace-nowrap text-muted-foreground">
												{formatDate(submission.createdAt)}
											</td>
											<td className="px-4 py-3 align-top">
												<div className="flex flex-col gap-1.5">
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
														iconOnly
														repoUrl={submission.repoUrl}
														projectName={submission.projectName}
													/>
												</div>
											</td>
											<td className="px-4 py-3 text-right align-top">
												<ReviewDialog iconOnly submission={submission} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				)}
			</Card>

			<Pagination
				meta={meta}
				buildHref={pageHref}
				itemLabel="pending reviews"
			/>
		</section>
	);
};

export default PendingReviewsPage;
