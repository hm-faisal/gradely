import { Pagination } from "@/components/tables/Pagination";
import { TableActionLink } from "@/components/tables/TableAction";
import { TableControls } from "@/components/tables/TableControls";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getMySubmissions } from "@/features/submissions/apis";
import { NewSubmissionDialog } from "@/features/submissions/components/NewSubmission.dialog";
import { StatusBadge } from "@/features/submissions/components/Status.badge";
import {
	buildOffsetHref,
	parseLimitParam,
	parseOffsetParam,
	parseSearchParam,
} from "@/utils/pagination";
import { formatDate, truncate } from "@/utils/utils";
import {
	CodeXml,
	ExternalLink,
	FileText,
	Globe,
	MessageSquareQuote,
} from "lucide-react";

type SubmissionsPageProps = {
	searchParams: Promise<{
		offset?: string | string[];
		limit?: string | string[];
		search?: string | string[];
		searchParam?: string | string[];
	}>;
};

const ExternalResourceLink = ({
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

const SubmissionsPage = async ({ searchParams }: SubmissionsPageProps) => {
	const params = await searchParams;
	const offset = parseOffsetParam(params.offset);
	const limit = parseLimitParam(params.limit);
	const search = parseSearchParam(params.searchParam ?? params.search);

	const submissionsPage = await getMySubmissions(offset, limit, search);
	const { items: submissions, meta } = submissionsPage;
	const newestFirst = [...submissions].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	const pageHref = (nextOffset: number) =>
		buildOffsetHref("/me/submissions", { limit, search }, nextOffset);

	return (
		<section
			aria-labelledby="submissions-heading"
			className="flex flex-col gap-4"
		>
			<TableControls
				pathname="/me/submissions"
				currentSearch={search}
				currentLimit={limit}
				searchPlaceholder="Search submissions by project name…"
			/>

			<Card>
				<CardHeader className="border-b">
					<CardTitle
						id="submissions-heading"
						className="flex items-center gap-2 text-xl"
					>
						All submissions
						<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
							{meta.total}
						</span>
					</CardTitle>
					<CardDescription>
						Every project you have submitted, newest first.
					</CardDescription>
					<CardAction>
						<NewSubmissionDialog />
					</CardAction>
				</CardHeader>

				{newestFirst.length === 0 ? (
					<CardContent className="items-center py-12 text-center">
						<span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
							<FileText className="size-5" aria-hidden="true" />
						</span>
						<div className="space-y-1">
							<p className="font-medium">No submissions yet</p>
							<p className="max-w-sm text-sm text-muted-foreground">
								Submit your first project to start collecting reviews and
								feedback.
							</p>
						</div>
						<NewSubmissionDialog />
					</CardContent>
				) : (
					<CardContent className="px-0">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[760px] border-collapse text-sm">
								<thead>
									<tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
										<th scope="col" className="px-4 py-2.5 font-medium">
											Project
										</th>
										<th scope="col" className="px-4 py-2.5 font-medium">
											Status
										</th>
										<th scope="col" className="px-4 py-2.5 font-medium">
											Submitted
										</th>
										<th scope="col" className="px-4 py-2.5 font-medium">
											Links
										</th>
										<th scope="col" className="px-4 py-2.5 font-medium">
											Feedback
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{newestFirst.map((submission) => (
										<tr
											key={submission.id}
											className="transition-colors hover:bg-muted/40"
										>
											<td className="max-w-[300px] px-4 py-3 align-top">
												<p className="truncate font-medium">
													{submission.projectName}
												</p>
												<p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
													{truncate(submission.description, 110)}
												</p>
											</td>
											<td className="px-4 py-3 align-top">
												<StatusBadge status={submission.status} />
											</td>
											<td className="px-4 py-3 align-top text-xs whitespace-nowrap text-muted-foreground">
												{formatDate(submission.createdAt)}
											</td>
											<td className="px-4 py-3 align-top">
												<div className="flex flex-col gap-1.5">
													<ExternalResourceLink
														href={submission.liveLink}
														label="Live demo"
														icon={Globe}
													/>
													<ExternalResourceLink
														href={submission.repoUrl}
														label="Repository"
														icon={CodeXml}
													/>
												</div>
											</td>
											<td className="px-4 py-3 align-top">
												{submission.feedback ? (
													<TableActionLink
														href={`#feedback-${submission.id}`}
														label="Read feedback"
													>
														<MessageSquareQuote
															className="size-3.5"
															aria-hidden="true"
														/>
													</TableActionLink>
												) : (
													<span className="text-xs text-muted-foreground">
														Not available
													</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				)}
			</Card>

			<Pagination meta={meta} buildHref={pageHref} itemLabel="submissions" />
		</section>
	);
};

export default SubmissionsPage;
