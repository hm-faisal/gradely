"use client";

import { cn } from "cn";
import {
  ClipboardCheck,
  LayoutDashboard,
  type LucideIcon,
  MessageSquareQuote,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ReviewerNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const NAV_ITEMS: ReviewerNavItem[] = [
  {
    href: "/reviewer",
    label: "Summary",
    description: "Your review activity",
    icon: LayoutDashboard,
  },
  {
    href: "/reviewer/submissions",
    label: "Pending reviews",
    description: "Submissions waiting for review",
    icon: ClipboardCheck,
  },
  {
    href: "/reviewer/reviews",
    label: "My reviews",
    description: "Feedback you have submitted",
    icon: MessageSquareQuote,
  },
];

export const ReviewerSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="lg:w-56 lg:shrink-0 xl:w-60">
      <nav
        aria-label="Reviewer sections"
        className="lg:sticky lg:top-24 lg:self-start"
      >
        <p className="hidden px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase lg:block">
          Review workspace
        </p>

        <ul className="flex gap-1 overflow-x-auto rounded-xl border bg-background p-1 lg:flex-col lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
          {NAV_ITEMS.map(({ href, label, description, icon: Icon }) => {
            const isActive =
              href === "/reviewer"
                ? pathname === "/reviewer"
                : pathname.startsWith(href);

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
