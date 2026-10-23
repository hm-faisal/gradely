import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardContent } from "@/features/dashboard/components/Dashboard.content";
import { DashboardNavbar } from "@/features/dashboard/components/Dashboard.navbar";
import { DashboardSidebar } from "@/features/dashboard/components/Dashboard.sidebar";

export const metadata: Metadata = {
  title: "My dashboard — Gradely",
  description:
    "Track your submissions, review status, and feedback in one place.",
};

type MeLayoutProps = {
  children: ReactNode;
  submissions: ReactNode;
  feedback: ReactNode;
};

const MeLayout = ({ children, submissions, feedback }: MeLayoutProps) => {
  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      <DashboardNavbar />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
        <DashboardSidebar />

        <main className="min-w-0 flex-1">
          <DashboardContent
            summary={children}
            submissions={submissions}
            feedback={feedback}
          />
        </main>
      </div>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <p>© Gradely. All rights reserved.</p>
          <p>Keep building — feedback makes it better.</p>
        </div>
      </footer>
    </div>
  );
};

export default MeLayout;
