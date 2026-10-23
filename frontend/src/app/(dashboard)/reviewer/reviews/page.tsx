import { CodeXml, ExternalLink, Globe, MessageSquareQuote } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/components/tables/Pagination";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getMyReviewCounts,
  getMyReviewedSubmissions,
} from "@/features/reviewer/apis";
import { ReviewDialog } from "@/features/reviewer/components/Review.dialog";
import { getCurrentUser } from "@/features/submissions/apis";
import { RepoPreviewDialog } from "@/features/submissions/components/RepoPreview.dialog";
import { StatusBadge } from "@/features/submissions/components/Status.badge";
import type { Submission } from "@/features/submissions/types";
import {
  buildPageHref,
  emptyPaginatedResult,
  parsePageParam,
} from "@/utils/pagination";
import { formatDate } from "@/utils/utils";

export const instant = false;

type MyReviewsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
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

const MyReviewsPage = async ({ searchParams }: MyReviewsPageProps) => {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const user = await getCurrentUser();
  const [reviewsPage, counts] = user
    ? await Promise.all([
        getMyReviewedSubmissions(user.id, page),
        getMyReviewCounts(user.id),
      ])
    : [emptyPaginatedResult<Submission>(page), { approved: 0, rejected: 0 }];
  const { items: reviews, meta } = reviewsPage;
  const newestFirst = [...reviews].sort(
    (a, b) =>
      new Date(b.reviewedAt ?? b.updatedAt).getTime() -
      new Date(a.reviewedAt ?? a.updatedAt).getTime(),
  );
  const { approved, rejected } = counts;

  const pageHref = (nextPage: number) =>
    buildPageHref("/reviewer/reviews", {}, nextPage);

  return (
    <section
      aria-labelledby="reviewer-reviews-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="reviewer-reviews-heading"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            My reviews
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
              {meta.total}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {meta.total === 0
              ? "Every review you submit will appear here."
              : `${approved} approved and ${rejected} rejected with feedback.`}
          </p>
        </div>
        <Link
          href="/reviewer/submissions"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
          })}
        >
          Pending reviews
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageSquareQuote
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Review history
          </CardTitle>
          <CardDescription>
            Feedback you have shared with students, newest first.
          </CardDescription>
        </CardHeader>

        {newestFirst.length === 0 ? (
          <CardContent className="items-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageSquareQuote className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-medium">No reviews yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Choose a pending submission to leave your first review.
              </p>
            </div>
            <Link
              href="/reviewer/submissions"
              className={buttonVariants({ size: "sm" })}
            >
              Review queue
            </Link>
          </CardContent>
        ) : (
          <CardContent className="divide-y px-0">
            {newestFirst.map((submission) => (
              <article
                key={submission.id}
                className="flex flex-col gap-3 px-(--card-spacing) py-5 first:pt-4 last:pb-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">
                      {submission.projectName}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {submission.student?.name ?? "Unknown student"} · Reviewed{" "}
                      {formatDate(submission.reviewedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={submission.status} />
                    <ReviewDialog submission={submission} mode="edit" />
                  </div>
                </div>

                <blockquote className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-line">
                  {submission.feedback ?? "No feedback was recorded."}
                </blockquote>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                </div>
              </article>
            ))}
          </CardContent>
        )}
      </Card>

      <Pagination meta={meta} buildHref={pageHref} itemLabel="reviews" />
    </section>
  );
};

export default MyReviewsPage;
