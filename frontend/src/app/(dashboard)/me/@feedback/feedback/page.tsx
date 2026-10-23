import { CodeXml, ExternalLink, Globe, MessageSquareQuote } from "lucide-react";
import { Pagination } from "@/components/tables/Pagination";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMyFeedback } from "@/features/submissions/apis";
import { StatusBadge } from "@/features/submissions/components/Status.badge";
import { buildPageHref, parsePageParam } from "@/utils/pagination";
import { formatDate } from "@/utils/utils";

type FeedbackPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

const FeedbackLink = ({
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

const FeedbackPage = async ({ searchParams }: FeedbackPageProps) => {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const feedbackPage = await getMyFeedback(page);
  const { items: feedbackItems, meta } = feedbackPage;

  const pageHref = (nextPage: number) =>
    buildPageHref("/me/feedback", {}, nextPage);

  return (
    <section aria-labelledby="feedback-heading">
      <Card id="feedback" className="scroll-mt-24">
        <CardHeader className="border-b">
          <CardTitle
            id="feedback-heading"
            className="flex items-center gap-2 text-xl"
          >
            Feedback
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
              {meta.total}
            </span>
          </CardTitle>
          <CardDescription>
            Reviewer notes for every submission you have made.
          </CardDescription>
          <CardAction>
            <span className="flex size-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <MessageSquareQuote className="size-4" aria-hidden="true" />
            </span>
          </CardAction>
        </CardHeader>

        {feedbackItems.length === 0 ? (
          <CardContent className="items-center py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageSquareQuote className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-medium">No feedback yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                When a reviewer leaves notes on one of your submissions, it will
                appear here.
              </p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="divide-y px-0">
            {feedbackItems.map((submission) => (
              <article
                key={submission.id}
                id={`feedback-${submission.id}`}
                className="flex scroll-mt-24 flex-col gap-3 px-(--card-spacing) py-5 first:pt-4 last:pb-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">
                      {submission.projectName}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Reviewed by{" "}
                      {submission.reviewer?.name ?? "the Gradely team"} on{" "}
                      {formatDate(submission.reviewedAt)}
                    </p>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>

                <blockquote className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-line">
                  {submission.feedback}
                </blockquote>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <FeedbackLink
                    href={submission.liveLink}
                    label="Live demo"
                    icon={Globe}
                  />
                  <FeedbackLink
                    href={submission.repoUrl}
                    label="Repository"
                    icon={CodeXml}
                  />
                </div>
              </article>
            ))}
          </CardContent>
        )}
      </Card>

      <Pagination
        meta={meta}
        buildHref={pageHref}
        itemLabel="feedback entries"
      />
    </section>
  );
};

export default FeedbackPage;
