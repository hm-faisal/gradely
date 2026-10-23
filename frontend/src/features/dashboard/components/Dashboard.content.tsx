"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type DashboardContentProps = {
  summary: ReactNode;
  submissions: ReactNode;
  feedback: ReactNode;
};

export const DashboardContent = ({
  summary,
  submissions,
  feedback,
}: DashboardContentProps) => {
  const pathname = usePathname();

  if (pathname.startsWith("/me/submissions")) {
    return <>{submissions}</>;
  }

  if (pathname.startsWith("/me/feedback")) {
    return <>{feedback}</>;
  }

  return <>{summary}</>;
};
