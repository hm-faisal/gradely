import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getAdminSummary } from "@/features/admin/apis";
import { StatusBreakdown } from "@/features/submissions/components/Status.breakdown";
import { SubmissionActivityChart } from "@/features/submissions/components/SubmissionActivity.chart";
import { cn } from "cn";
import {
	CircleCheck,
	Clock3,
	FileText,
	type LucideIcon,
	MessageSquareQuote,
	ShieldCheck,
	TrendingUp,
	Users,
} from "lucide-react";

export const instant = false;

type StatCardProps = {
	label: string;
	value: number;
	hint: string;
	icon: LucideIcon;
	tone: string;
};

const StatCard = ({ label, value, hint, icon: Icon, tone }: StatCardProps) => (
	<Card size="sm" className="gap-2">
		<CardContent className="flex-row items-start justify-between gap-3">
			<div className="flex min-w-0 flex-col gap-1">
				<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					{label}
				</p>
				<p className="text-2xl font-semibold tabular-nums">{value}</p>
				<p className="truncate text-xs text-muted-foreground">{hint}</p>
			</div>
			<span
				className={cn(
					"flex size-9 shrink-0 items-center justify-center rounded-lg",
					tone,
				)}
			>
				<Icon className="size-4" aria-hidden="true" />
			</span>
		</CardContent>
	</Card>
);

const RoleBar = ({
	label,
	value,
	total,
	tone,
}: {
	label: string;
	value: number;
	total: number;
	tone: string;
}) => (
	<div className="space-y-1.5">
		<div className="flex items-center justify-between gap-3 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium tabular-nums">{value}</span>
		</div>
		<div className="h-1.5 overflow-hidden rounded-full bg-muted">
			<div
				className={cn("h-full rounded-full", tone)}
				style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}
			/>
		</div>
	</div>
);

const AdminPage = async () => {
	const summary = await getAdminSummary();

	if (!summary) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Summary unavailable</CardTitle>
					<CardDescription>
						The admin summary could not be loaded. Refresh the page to try
						again.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const statusCounts = {
		PENDING: summary.submissions.pending,
		APPROVED: summary.submissions.approved,
		REJECTED: summary.submissions.rejected,
	};
	const currentMonth = summary.submissions.monthly.at(-1)?.total ?? 0;
	const reviewRate =
		summary.submissions.total > 0
			? Math.round(
					((summary.submissions.approved + summary.submissions.rejected) /
						summary.submissions.total) *
						100,
				)
			: 0;

	return (
		<section
			aria-labelledby="admin-summary-heading"
			className="flex flex-col gap-4"
		>
			<div className="flex flex-wrap items-end justify-between gap-2">
				<div>
					<h2
						id="admin-summary-heading"
						className="text-xl font-semibold tracking-tight"
					>
						Platform summary
					</h2>
					<p className="text-sm text-muted-foreground">
						A snapshot of people, submissions, and feedback across Gradely.
					</p>
				</div>
				<p className="text-xs text-muted-foreground">
					{currentMonth} {currentMonth === 1 ? "submission" : "submissions"}{" "}
					this month
				</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
				<StatCard
					label="Total users"
					value={summary.users.total}
					hint={`${summary.users.students} students`}
					icon={Users}
					tone="bg-primary/10 text-primary"
				/>
				<StatCard
					label="Reviewers"
					value={summary.users.reviewers}
					hint={`${summary.users.admins} admin${summary.users.admins === 1 ? "" : "s"}`}
					icon={ShieldCheck}
					tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
				/>
				<StatCard
					label="Submissions"
					value={summary.submissions.total}
					hint={`${summary.submissions.pending} waiting for review`}
					icon={FileText}
					tone="bg-sky-500/10 text-sky-600 dark:text-sky-400"
				/>
				<StatCard
					label="Pending review"
					value={summary.submissions.pending}
					hint={`${reviewRate}% of submissions reviewed`}
					icon={Clock3}
					tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
				/>
				<StatCard
					label="Approved"
					value={summary.submissions.approved}
					hint={`${summary.submissions.rejected} rejected`}
					icon={CircleCheck}
					tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
				/>
				<StatCard
					label="Feedbacks"
					value={summary.feedbacks.total}
					hint="Feedback records from reviewers"
					icon={MessageSquareQuote}
					tone="bg-violet-500/10 text-violet-600 dark:text-violet-400"
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Submission activity</CardTitle>
						<CardDescription>
							Projects submitted over the last six months.
						</CardDescription>
						<CardAction>
							<span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
								<TrendingUp className="size-3.5" aria-hidden="true" />
								{currentMonth} this month
							</span>
						</CardAction>
					</CardHeader>
					<CardContent>
						<SubmissionActivityChart data={summary.submissions.monthly} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Review pipeline</CardTitle>
						<CardDescription>Status across every submission.</CardDescription>
					</CardHeader>
					<CardContent>
						<StatusBreakdown
							counts={statusCounts}
							total={summary.submissions.total}
							description="Review status across every submission on Gradely."
						/>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Community</CardTitle>
					<CardDescription>
						How access is distributed across the platform.
					</CardDescription>
				</CardHeader>
				<CardContent className="gap-4">
					<RoleBar
						label="Students"
						value={summary.users.students}
						total={summary.users.total}
						tone="bg-sky-500"
					/>
					<RoleBar
						label="Reviewers"
						value={summary.users.reviewers}
						total={summary.users.total}
						tone="bg-emerald-500"
					/>
					<RoleBar
						label="Admins"
						value={summary.users.admins}
						total={summary.users.total}
						tone="bg-violet-500"
					/>
				</CardContent>
			</Card>
		</section>
	);
};

export default AdminPage;
