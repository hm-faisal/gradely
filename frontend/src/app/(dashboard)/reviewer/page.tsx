import { cn } from "cn";
import {
  ArrowRight,
  CheckCircle2,
  CircleCheck,
  ClipboardCheck,
  FileText,
  type LucideIcon,
  MessageSquareQuote,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAllMyAssignedSubmissions,
  getAllMyReviewedSubmissions,
} from "@/features/reviewer/apis";
import { ReviewDialog } from "@/features/reviewer/components/Review.dialog";
import { getCurrentUser } from "@/features/submissions/apis";
import { StatusBadge } from "@/features/submissions/components/Status.badge";
import { formatDate, getInitials, truncate } from "@/utils/utils";

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

const ReviewerSummaryPage = async () => {
  const user = await getCurrentUser();
  const [pending, reviewed] = await Promise.all([
    user ? getAllMyAssignedSubmissions(user.id) : Promise.resolve([]),
    user ? getAllMyReviewedSubmissions(user.id) : Promise.resolve([]),
  ]);

  const approved = reviewed.filter(
    (submission) => submission.status === "APPROVED",
  ).length;
  const rejected = reviewed.filter(
    (submission) => submission.status === "REJECTED",
  ).length;
  const newestPending = [...pending].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const recentReviews = [...reviewed].sort(
    (a, b) =>
      new Date(b.reviewedAt ?? b.updatedAt).getTime() -
      new Date(a.reviewedAt ?? a.updatedAt).getTime(),
  );

  return (
    <section
      aria-labelledby="reviewer-summary-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="reviewer-summary-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Summary
          </h2>
          <p className="text-sm text-muted-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ""}. Here is your
            review queue and recent activity.
          </p>
        </div>
        <Link
          href="/reviewer/submissions"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "gap-1.5",
          })}
        >
          Review queue
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending reviews"
          value={pending.length}
          hint={
            pending.length === 0
              ? "Nothing assigned right now"
              : "Submissions assigned to you"
          }
          icon={ClipboardCheck}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Reviews completed"
          value={reviewed.length}
          hint="Submissions you have reviewed"
          icon={CheckCircle2}
          tone="bg-primary/10 text-primary"
        />
        <StatCard
          label="Approved"
          value={approved}
          hint="Accepted submissions"
          icon={CircleCheck}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Rejected"
          value={rejected}
          hint="Returned with feedback"
          icon={XCircle}
          tone="bg-destructive/10 text-destructive"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              Next up
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                {newestPending.length}
              </span>
            </CardTitle>
            <CardDescription>
              The newest submissions assigned to you.
            </CardDescription>
            <CardAction>
              <Link
                href="/reviewer/submissions"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </CardAction>
          </CardHeader>

          {newestPending.length === 0 ? (
            <CardContent className="items-center py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p className="font-medium">You are all caught up</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  New submissions assigned to you will appear here.
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="divide-y px-0">
              {newestPending.slice(0, 5).map((submission) => (
                <div
                  key={submission.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-(--card-spacing) py-3 first:pt-1 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(
                        submission.student?.name ?? "Student",
                        submission.student?.email,
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {submission.projectName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {submission.student?.name ?? "Unknown student"} ·{" "}
                        {formatDate(submission.createdAt)}
                      </p>
                    </div>
                  </div>
                  <ReviewDialog submission={submission} />
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquareQuote
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Recent reviews
            </CardTitle>
            <CardDescription>Feedback you have submitted.</CardDescription>
            <CardAction>
              <Link
                href="/reviewer/reviews"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </CardAction>
          </CardHeader>

          {recentReviews.length === 0 ? (
            <CardContent className="items-center py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p className="font-medium">No reviews yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Pick a submission from the queue to leave your first review.
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="divide-y px-0">
              {recentReviews.slice(0, 4).map((submission) => (
                <div
                  key={submission.id}
                  className="space-y-2 px-(--card-spacing) py-3 first:pt-1 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {submission.projectName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {submission.student?.name ?? "Unknown student"} ·{" "}
                        {formatDate(submission.reviewedAt)}
                      </p>
                    </div>
                    <StatusBadge status={submission.status} />
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {truncate(
                      submission.feedback ?? "No feedback provided",
                      140,
                    )}
                  </p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            How reviewing works
          </CardTitle>
          <CardDescription>
            Review pending projects, approve strong work, or reject with clear,
            constructive feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            You can refine a review from My reviews after submitting it. Your
            decision and feedback are visible to the student and to
            administrators, and are recorded in the feedback history.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default ReviewerSummaryPage;
