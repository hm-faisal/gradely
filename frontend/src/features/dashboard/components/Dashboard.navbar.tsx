import { NewSubmissionDialog } from "@/features/submissions/components/NewSubmission.dialog";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardUser, UserMenuSkeleton } from "./Dashboard.user";
import { ThemeToggle } from "./Theme.toggle";

type DashboardNavbarProps = {
	homeHref?: string;
	homeLabel?: string;
	showNewSubmission?: boolean;
};

export const DashboardNavbar = ({
	homeHref = "/me",
	homeLabel = "Gradely dashboard",
	showNewSubmission = true,
}: DashboardNavbarProps) => {
	return (
		<header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
				<Link
					href={homeHref}
					className="flex shrink-0 items-center gap-2.5 rounded-md text-base font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
					aria-label={homeLabel}
				>
					<span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
						<GraduationCap className="size-5" aria-hidden="true" />
					</span>
					<span className="hidden sm:inline">Gradely</span>
				</Link>

				<div className="flex items-center gap-1 sm:gap-2">
					{showNewSubmission ? <NewSubmissionDialog /> : null}
					<Suspense fallback={<UserMenuSkeleton />}>
						<DashboardUser />
					</Suspense>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
};
