import { Eye, MessageSquareQuote } from "lucide-react";
import { Pagination } from "@/components/tables/Pagination";
import { TableActionLink } from "@/components/tables/TableAction";
import { TableControls } from "@/components/tables/TableControls";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminFeedbacks } from "@/features/admin/apis";
import { EditFeedbackDialog } from "@/features/admin/components/EditFeedback.dialog";
import { StatusBadge } from "@/features/submissions/components/Status.badge";
import {
  buildOffsetHref,
  parseLimitParam,
  parseOffsetParam,
  parseSearchParam,
} from "@/utils/pagination";
import { formatDate, getInitials, truncate } from "@/utils/utils";

export const instant = false;

type AdminFeedbacksPageProps = {
  searchParams: Promise<{
    offset?: string | string[];
    limit?: string | string[];
    search?: string | string[];
    searchParam?: string | string[];
  }>;
};

const AdminFeedbacksPage = async ({
  searchParams,
}: AdminFeedbacksPageProps) => {
  const params = await searchParams;
  const offset = parseOffsetParam(params.offset);
  const limit = parseLimitParam(params.limit);
  const search = parseSearchParam(params.searchParam ?? params.search);
  const feedbacksPage = await getAdminFeedbacks(offset, limit, search);
  const { items: feedbacks, meta } = feedbacksPage;
  const newestFirst = [...feedbacks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const pageHref = (nextOffset: number) =>
    buildOffsetHref("/admin/feedbacks", { limit, search }, nextOffset);

  return (
    <section
      aria-labelledby="admin-feedbacks-heading"
      className="flex flex-col gap-4"
    >
      <div>
        <h2
          id="admin-feedbacks-heading"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight"
        >
          All feedbacks
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
            {meta.total}
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Every piece of reviewer feedback, newest first.
        </p>
      </div>

      <TableControls
        pathname="/admin/feedbacks"
        currentSearch={search}
        currentLimit={limit}
        searchPlaceholder="Search by feedback content…"
      />

      <Card>
        {newestFirst.length === 0 ? (
          <CardContent className="items-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MessageSquareQuote className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-medium">No feedback yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Feedback will appear here after a reviewer reviews a submission.
              </p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Project
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Student
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Reviewer
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Feedback
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Created
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
                  {newestFirst.map((feedback) => (
                    <tr
                      key={feedback.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="max-w-[220px] px-4 py-3 align-top">
                        <p className="truncate font-medium">
                          {truncate(feedback.submission.projectName, 20)}
                        </p>
                        <div className="mt-1">
                          <StatusBadge status={feedback.submission.status} />
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                            {getInitials(
                              feedback.submission.student?.name ?? "Unknown",
                              feedback.submission.student?.email,
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {truncate(
                                feedback.submission.student?.name ??
                                  "Unknown student",
                                20,
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {truncate(
                                feedback.submission.student?.email ?? "—",
                                20,
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-medium">
                          {feedback.reviewer?.name ?? "Unknown reviewer"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {feedback.reviewer?.email ?? "—"}
                        </p>
                      </td>
                      <td className="max-w-[320px] px-4 py-3 align-top">
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {truncate(feedback.content, 100)}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {formatDate(feedback.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                          <EditFeedbackDialog feedback={feedback} />
                          <TableActionLink
                            href={`/admin/feedbacks/${feedback.id}`}
                            label="View feedback details"
                          >
                            <Eye className="size-3.5" aria-hidden="true" />
                          </TableActionLink>
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

      <Pagination
        meta={meta}
        buildHref={pageHref}
        itemLabel="feedback entries"
      />
    </section>
  );
};

export default AdminFeedbacksPage;
