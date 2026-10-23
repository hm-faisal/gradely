import {
  ArrowLeft,
  CalendarDays,
  CodeXml,
  Globe,
  MessageSquareQuote,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminFeedback } from "@/features/admin/apis";
import { StatusBadge } from "@/features/submissions/components/Status.badge";
import { formatDate } from "@/utils/utils";
import { ResourceLink } from "./_components/ResourceLink";

export const instant = false;

type FeedbackDetailPageProps = {
  params: Promise<{ id: string }>;
};

const AdminFeedbackDetailPage = async ({ params }: FeedbackDetailPageProps) => {
  const { id } = await params;
  const feedback = await getAdminFeedback(id);

  if (!feedback) {
    return (
      <section className="flex flex-col gap-4">
        <Link
          href="/admin/feedbacks"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "w-fit gap-1.5",
          })}
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          All feedbacks
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Feedback not found</CardTitle>
            <CardDescription>
              This feedback may have been removed, or the link is incorrect.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="feedback-detail-heading"
      className="flex flex-col gap-4"
    >
      <div>
        <Link
          href="/admin/feedbacks"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "w-fit gap-1.5",
          })}
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          All feedbacks
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="feedback-detail-heading"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            <MessageSquareQuote
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
            Feedback details
          </h2>
          <p className="text-sm text-muted-foreground">
            {feedback.submission.projectName}
          </p>
        </div>
        <StatusBadge status={feedback.submission.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Reviewer feedback</CardTitle>
            <CardDescription>
              Submitted {formatDate(feedback.createdAt)} · Last updated{" "}
              {formatDate(feedback.updatedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <blockquote className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-line">
              {feedback.content}
            </blockquote>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Student
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <UserRound className="size-3.5" aria-hidden="true" />
                  {feedback.submission.student?.name ?? "Unknown student"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {feedback.submission.student?.email ?? "No email available"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Reviewer
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {feedback.reviewer?.name ?? "Unknown reviewer"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {feedback.reviewer?.email ?? "No email available"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project</CardTitle>
              <CardDescription>
                Submitted {formatDate(feedback.submission.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feedback.submission.description}
              </p>
              <div className="flex flex-col gap-2 border-t pt-3">
                <ResourceLink
                  href={feedback.submission.liveLink}
                  label="Live demo"
                  icon={Globe}
                />
                <ResourceLink
                  href={feedback.submission.repoUrl}
                  label="Repository"
                  icon={CodeXml}
                />
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Reviewed {formatDate(feedback.submission.reviewedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AdminFeedbackDetailPage;
