"use client";

import { cn } from "cn";
import {
  FileText,
  LayoutDashboard,
  type LucideIcon,
  MessageSquareQuote,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/me",
    label: "Summary",
    description: "Stats and activity",
    icon: LayoutDashboard,
  },
  {
    href: "/me/submissions",
    label: "Submissions",
    description: "Your projects",
    icon: FileText,
  },
  {
    href: "/me/feedback",
    label: "Feedback",
    description: "Reviewer notes",
    icon: MessageSquareQuote,
  },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="lg:w-56 lg:shrink-0 xl:w-60">
      <nav
        aria-label="Dashboard sections"
        className="lg:sticky lg:top-24 lg:self-start"
      >
        <p className="hidden px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase lg:block">
          Workspace
        </p>

        <ul className="flex gap-1 overflow-x-auto rounded-xl border bg-background p-1 lg:flex-col lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
          {NAV_ITEMS.map(({ href, label, description, icon: Icon }) => {
            const isActive =
              href === "/me" ? pathname === "/me" : pathname.startsWith(href);

            return (
              <li key={href} className="shrink-0 lg:shrink">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  title={description}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors lg:w-full",
                    isActive
                      ? "bg-primary/10 text-primary ring-1 ring-primary/15 ring-inset"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
