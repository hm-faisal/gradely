import { Users } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/components/tables/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminUsers } from "@/features/admin/apis";
import { EditUserDialog } from "@/features/admin/components/EditUser.dialog";
import { UserDetailsDialog } from "@/features/admin/components/UserDetails.dialog";
import type { UserRole } from "@/features/admin/types";
import {
  getRoleLabel,
  getRoleStyle,
  getUserStatusLabel,
  getUserStatusStyle,
} from "@/features/admin/utils";
import { getCurrentUser } from "@/features/submissions/apis";
import { buildPageHref, parsePageParam } from "@/utils/pagination";
import { formatDate, getInitials, truncate } from "@/utils/utils";

export const instant = false;

type AdminUsersPageProps = {
  searchParams: Promise<{
    role?: string | string[];
    page?: string | string[];
  }>;
};

const ROLE_FILTERS: { label: string; role?: UserRole }[] = [
  { label: "All users" },
  { label: "Students", role: "STUDENT" },
  { label: "Admins", role: "ADMIN" },
  { label: "Reviewers", role: "REVIEWER" },
];

const AdminUsersPage = async ({ searchParams }: AdminUsersPageProps) => {
  const params = await searchParams;
  const rawRole = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = ROLE_FILTERS.find(
    (filter) => filter.role !== undefined && filter.role === rawRole,
  )?.role;
  const page = parsePageParam(params.page);

  const [usersPage, currentUser] = await Promise.all([
    getAdminUsers(page, selectedRole),
    getCurrentUser(),
  ]);
  const { items: users, meta } = usersPage;

  const filterHref = (role?: UserRole) =>
    role ? `/admin/users?role=${role}` : "/admin/users";

  const pageHref = (nextPage: number) =>
    buildPageHref("/admin/users", { role: selectedRole }, nextPage);

  return (
    <section
      aria-labelledby="admin-users-heading"
      className="flex flex-col gap-4"
    >
      <div>
        <h2
          id="admin-users-heading"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight"
        >
          All users
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums">
            {meta.total}
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Filter every Gradely account by role. Open a user to review details
          and update access.
        </p>
      </div>

      <nav aria-label="Filter users by role" className="flex flex-wrap gap-1">
        {ROLE_FILTERS.map((filter) => {
          const isActive = filter.role === selectedRole;

          return (
            <Link
              key={filter.label}
              href={filterHref(filter.role)}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <Card>
        {users.length === 0 ? (
          <CardContent className="items-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-medium">No users found</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                There are no accounts matching this role filter yet.
              </p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      User
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Role
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
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(user.name, user.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {user.name}
                              {currentUser?.id === user.id ? (
                                <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  You
                                </span>
                              ) : null}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {truncate(user.email, 20)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getRoleStyle(user.role)}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getUserStatusStyle(user.status)}`}
                        >
                          {getUserStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                          <EditUserDialog
                            user={user}
                            currentUserId={currentUser?.id ?? ""}
                          />
                          <UserDetailsDialog
                            user={user}
                            currentUserId={currentUser?.id ?? ""}
                          />
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

      <Pagination meta={meta} buildHref={pageHref} itemLabel="users" />
    </section>
  );
};

export default AdminUsersPage;
