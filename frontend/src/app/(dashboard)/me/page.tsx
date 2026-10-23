import { cn } from "cn";
import {
  CircleCheck,
  Clock3,
  FileText,
  type LucideIcon,
  MessageSquareQuote,
  TrendingUp,
} from "lucide-react";
import { connection } from "next/server";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllMySubmissions } from "@/features/submissions/apis";
import { StatusBreakdown } from "@/features/submissions/components/Status.breakdown";
import { SubmissionActivityChart } from "@/features/submissions/components/SubmissionActivity.chart";
import {
  getFeedbackSubmissions,
  getMonthlyActivity,
  getStatusCounts,
} from "@/utils/utils";

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

const SummaryPage = async () => {
  // The summary depends on the current month, so render it at request time.
  await connection();

  const submissions = await getAllMySubmissions();
  const counts = getStatusCounts(submissions);
  const total = submissions.length;
  const activity = getMonthlyActivity(submissions, new Date());
  const currentMonth = activity.at(-1)?.total ?? 0;
  const previousMonth = activity.at(-2)?.total ?? 0;
  const monthDelta = currentMonth - previousMonth;
  const feedbackCount = getFeedbackSubmissions(submissions).length;
  const approvedRate =
    total > 0 ? Math.round((counts.APPROVED / total) * 100) : 0;
  const reviewed = total - counts.PENDING;

  const monthHint =
    monthDelta > 0
      ? `+${monthDelta} vs last month`
      : monthDelta < 0
        ? `${monthDelta} vs last month`
        : "No change vs last month";

  return (
    <section aria-labelledby="summary-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="summary-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Summary
          </h2>
          <p className="text-sm text-muted-foreground">
            A snapshot of everything you have submitted so far.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {currentMonth} {currentMonth === 1 ? "submission" : "submissions"}{" "}
          this month
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total submissions"
          value={total}
          hint={monthHint}
          icon={FileText}
          tone="bg-primary/10 text-primary"
        />
        <StatCard
          label="Approved"
          value={counts.APPROVED}
          hint={`${approvedRate}% of all submissions`}
          icon={CircleCheck}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Pending review"
          value={counts.PENDING}
          hint="Waiting for a reviewer"
          icon={Clock3}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Feedback received"
          value={feedbackCount}
          hint={`${reviewed} reviewed so far`}
          icon={MessageSquareQuote}
          tone="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submission activity</CardTitle>
            <CardDescription>
              Projects you submitted over the last six months.
            </CardDescription>
            <CardAction>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <TrendingUp className="size-3.5" aria-hidden="true" />
                {currentMonth} this month
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <SubmissionActivityChart data={activity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
            <CardDescription>
              How your submissions are progressing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusBreakdown counts={counts} total={total} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SummaryPage;
