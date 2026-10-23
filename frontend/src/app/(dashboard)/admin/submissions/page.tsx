import { FileText } from "lucide-react";
import { Pagination } from "@/components/tables/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAdminSubmissions,
  getAdminSummary,
  getAdminUnassignedPendingCount,
  getAllAdminUsers,
} from "@/features/admin/apis";
import { AssignReviewerDialog } from "@/features/admin/components/AssignReviewer.dialog";
import { AutoAssignReviewersButton } from "@/features/admin/components/AutoAssignReviewers.button";
import { EditSubmissionDialog } from "@/features/admin/components/EditSubmission.dialog";
import { SubmissionDetailsDialog } from "@/features/admin/components/SubmissionDetails.dialog";
import { RepoPreviewDialog } from "@/features/submissions/components/RepoPreview.dialog";
import { StatusBadge } from "@/features/submissions/components/Status.badge";
import { buildPageHref, parsePageParam } from "@/utils/pagination";
import { formatDate, getInitials, truncate } from "@/utils/utils";

export const instant = false;

type AdminSubmissionsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

const AdminSubmissionsPage = async ({
  searchParams,
}: AdminSubmissionsPageProps) => {
  const params = await searchParams;
  const page = parsePageParam(params.page);

  const [submissionsPage, reviewers, summary, unassignedPending] =
    await Promise.all([
      getAdminSubmissions(page),
      getAllAdminUsers("REVIEWER"),
      getAdminSummary(),
      getAdminUnassignedPendingCount(),
    ]);
  const { items: submissions, meta } = submissionsPage;
  const newestFirst = [...submissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const pending = summary?.submissions.pending ?? 0;
  const activeReviewers = reviewers.filter(
    (reviewer) => reviewer.status === "ACTIVE",
  );

  const pageHref = (nextPage: number) =>
    buildPageHref("/admin/submissions", {}, nextPage);

  return (
    <section
      aria-labelledby="admin-submissions-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="admin-submissions-heading"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            All submissions
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
              {meta.total}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Every project submitted to Gradely, newest first. {pending} waiting
            for review
            {unassignedPending > 0
              ? `, ${unassignedPending} without a reviewer`
              : ""}
            .
          </p>
        </div>
        <AutoAssignReviewersButton
          unassignedCount={unassignedPending}
          reviewerCount={activeReviewers.length}
        />
      </div>

      <Card>
        {newestFirst.length === 0 ? (
          <CardContent className="items-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-medium">No submissions yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Student submissions will appear here as soon as they are
                created.
              </p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Project
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Student
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Submitted
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Reviewer
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-right font-medium"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {newestFirst.map((submission) => (
                    <tr
                      key={submission.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="max-w-[280px] px-4 py-3 align-top">
                        <p className="truncate font-medium">
                          {truncate(submission.projectName, 30)}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {truncate(submission.description, 30)}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                            {getInitials(
                              submission.student?.name ?? "Unknown",
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
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {formatDate(submission.createdAt)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {submission.reviewer ? (
                          <div>
                            <p className="text-sm font-medium">
                              {submission.reviewer.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {submission.reviewer.email}
                            </p>
                            {submission.status === "PENDING" ? (
                              <span className="mt-1 inline-flex rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-400">
                                Assigned
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                          {submission.status === "PENDING" ? (
                            <AssignReviewerDialog
                              submission={submission}
                              reviewers={activeReviewers}
                            />
                          ) : null}
                          <EditSubmissionDialog submission={submission} />
                          <RepoPreviewDialog
                            iconOnly
                            repoUrl={submission.repoUrl}
                            projectName={submission.projectName}
                          />
                          <SubmissionDetailsDialog submission={submission} />
                        </div>
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

export default AdminSubmissionsPage;
