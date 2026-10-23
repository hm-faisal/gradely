import { cn } from "cn";

const Skeleton = ({ className }: { className?: string }) => (
	<div
		aria-hidden="true"
		className={cn("animate-pulse rounded-md bg-muted", className)}
	/>
);

const STAT_KEYS = ["one", "two", "three", "four", "five", "six"];
const NAV_KEYS = ["summary", "submissions", "feedback"];
const ROLE_KEYS = ["students", "reviewers", "admins"];

type DashboardContentSkeletonProps = {
	stats?: number;
	statColumns?: 3 | 4;
	footerCard?: boolean;
};

export const DashboardContentSkeleton = ({
	stats = 4,
	statColumns = 4,
	footerCard = false,
}: DashboardContentSkeletonProps) => (
	<section
		aria-busy="true"
		aria-label="Loading dashboard summary"
		className="flex flex-col gap-4"
	>
		<div className="flex flex-wrap items-end justify-between gap-2">
			<div className="space-y-2">
				<Skeleton className="h-6 w-36" />
				<Skeleton className="h-3 w-72 max-w-full" />
			</div>
			<Skeleton className="h-3 w-32" />
		</div>

		<div
			className={cn(
				"grid gap-3 sm:grid-cols-2",
				statColumns === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4",
			)}
		>
			{STAT_KEYS.slice(0, stats).map((key) => (
				<div
					key={key}
					className="flex items-start justify-between gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
				>
					<div className="w-full space-y-2.5">
						<Skeleton className="h-2.5 w-24" />
						<Skeleton className="h-7 w-12" />
						<Skeleton className="h-2.5 w-32" />
					</div>
					<Skeleton className="size-9 shrink-0 rounded-lg" />
				</div>
			))}
		</div>

		<div className="grid gap-4 lg:grid-cols-3">
			<div className="h-80 rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-2">
				<div className="space-y-3 p-6">
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-3 w-64" />
					<Skeleton className="mt-8 h-48 w-full rounded-lg" />
				</div>
			</div>
			<div className="h-80 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
				<div className="space-y-3">
					<Skeleton className="h-4 w-36" />
					<Skeleton className="h-3 w-48" />
					<Skeleton className="mx-auto mt-8 size-28 rounded-full" />
				</div>
			</div>
		</div>

		{footerCard ? (
			<div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="mt-2 h-3 w-64" />
				<div className="mt-5 space-y-4">
					{ROLE_KEYS.map((key) => (
						<div key={key} className="space-y-1.5">
							<div className="flex items-center justify-between gap-3">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-3 w-8" />
							</div>
							<Skeleton className="h-1.5 w-full rounded-full" />
						</div>
					))}
				</div>
			</div>
		) : null}
	</section>
);

export const DashboardShellSkeleton = () => (
	<section
		aria-busy="true"
		aria-label="Loading dashboard"
		className="flex min-h-svh flex-col bg-muted/20"
	>
		<header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-2.5">
					<Skeleton className="size-9 rounded-lg" />
					<Skeleton className="hidden h-5 w-20 sm:block" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="hidden h-8 w-32 rounded-md sm:block" />
					<Skeleton className="size-8 rounded-full" />
					<Skeleton className="size-8 rounded-md" />
				</div>
			</div>
		</header>

		<div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
			<aside className="lg:w-56 lg:shrink-0 xl:w-60">
				<Skeleton className="mb-3 hidden h-2.5 w-24 lg:block" />
				<div className="flex gap-1 overflow-hidden rounded-xl border bg-background p-1 lg:flex-col lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
					{NAV_KEYS.map((key) => (
						<Skeleton key={key} className="h-9 flex-1 rounded-lg lg:w-full" />
					))}
				</div>
			</aside>

			<main className="min-w-0 flex-1">
				<DashboardContentSkeleton />
			</main>
		</div>

		<footer className="border-t border-border/60">
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 lg:px-8">
				<Skeleton className="h-3 w-40" />
				<Skeleton className="h-3 w-52" />
			</div>
		</footer>
	</section>
);
