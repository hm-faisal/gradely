import { getCurrentUser } from "@/features/submissions/apis";
import Link from "next/link";
import { UserMenu } from "./User.menu";

export const DashboardUser = async () => {
	const user = await getCurrentUser();

	if (!user) {
		return (
			<Link
				href="/"
				className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-muted"
			>
				Sign in
			</Link>
		);
	}

	return <UserMenu user={user} />;
};

export const UserMenuSkeleton = () => (
	<div className="flex h-10 items-center gap-2 pr-2">
		<span className="size-8 animate-pulse rounded-full bg-muted" />
		<span className="hidden flex-col gap-1.5 sm:flex">
			<span className="h-3 w-24 animate-pulse rounded bg-muted" />
			<span className="h-2.5 w-16 animate-pulse rounded bg-muted" />
		</span>
	</div>
);
