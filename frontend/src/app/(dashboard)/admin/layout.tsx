import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/features/admin/components/Admin.sidebar";
import { DashboardNavbar } from "@/features/dashboard/components/Dashboard.navbar";

export const metadata: Metadata = {
  title: "Admin dashboard — Gradely",
  description:
    "Manage submissions, feedback, reviewer accounts, and platform access.",
};

export const instant = false;

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      <DashboardNavbar
        homeHref="/admin"
        homeLabel="Gradely admin dashboard"
        showNewSubmission={false}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
        <AdminSidebar />

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <p>© Gradely. All rights reserved.</p>
          <p>Admin console — manage the community.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
