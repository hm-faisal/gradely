import { ShieldCheck } from "lucide-react";
import { Pagination } from "@/components/tables/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminUsers } from "@/features/admin/apis";
import { NewReviewerDialog } from "@/features/admin/components/NewReviewer.dialog";
import { UserDetailsDialog } from "@/features/admin/components/UserDetails.dialog";
import { getUserStatusLabel, getUserStatusStyle } from "@/features/admin/utils";
import { getCurrentUser } from "@/features/submissions/apis";
import { buildPageHref, parsePageParam } from "@/utils/pagination";
import { formatDate, getInitials } from "@/utils/utils";

export const instant = false;

type AdminReviewersPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

const AdminReviewersPage = async ({
  searchParams,
}: AdminReviewersPageProps) => {
  const params = await searchParams;
  const page = parsePageParam(params.page);

  const [reviewersPage, currentUser] = await Promise.all([
    getAdminUsers(page, "REVIEWER"),
    getCurrentUser(),
  ]);
  const { items: reviewers, meta } = reviewersPage;
  const newestFirst = [...reviewers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const pageHref = (nextPage: number) =>
    buildPageHref("/admin/reviewers", {}, nextPage);

  return (
    <section
      aria-labelledby="admin-reviewers-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="admin-reviewers-heading"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            All reviewers
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
              {meta.total}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            The people who review student submissions and leave feedback.
          </p>
        </div>
        <NewReviewerDialog />
      </div>

      <Card>
        {newestFirst.length === 0 ? (
          <CardContent className="items-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-medium">No reviewers yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add your first reviewer to start distributing submissions for
                review.
              </p>
            </div>
            <NewReviewerDialog />
          </CardContent>
        ) : (
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Reviewer
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Joined
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
                  {newestFirst.map((reviewer) => (
                    <tr
                      key={reviewer.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {getInitials(reviewer.name, reviewer.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {reviewer.name}
                              {currentUser?.id === reviewer.id ? (
                                <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  You
                                </span>
                              ) : null}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {reviewer.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getUserStatusStyle(reviewer.status)}`}
                        >
                          {getUserStatusLabel(reviewer.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {formatDate(reviewer.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <UserDetailsDialog
                          user={reviewer}
                          currentUserId={currentUser?.id ?? ""}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      <Pagination meta={meta} buildHref={pageHref} itemLabel="reviewers" />
    </section>
  );
};

export default AdminReviewersPage;
