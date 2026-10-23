import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardNavbar } from "@/features/dashboard/components/Dashboard.navbar";
import { ReviewerSidebar } from "@/features/reviewer/components/Reviewer.sidebar";

export const metadata: Metadata = {
  title: "Reviewer dashboard — Gradely",
  description:
    "Review student submissions, leave feedback, and track your review activity.",
};

// The reviewer workspace reads the session and live data on every request.
export const instant = false;

const ReviewerLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      <DashboardNavbar
        homeHref="/reviewer"
        homeLabel="Gradely reviewer dashboard"
        showNewSubmission={false}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
        <ReviewerSidebar />

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <p>© Gradely. All rights reserved.</p>
          <p>Review queue — help students improve.</p>
        </div>
      </footer>
    </div>
  );
};

export default ReviewerLayout;
