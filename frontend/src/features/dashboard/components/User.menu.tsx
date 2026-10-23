"use client";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions/logout.action";
import type { AuthUser } from "@/features/auth/types";
import { cn } from "cn";
import {
	ChevronDown,
	ClipboardCheck,
	LayoutDashboard,
	LogOut,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useUserMenu } from "../hooks/useUserMenu.hook";

type UserMenuProps = {
	user: AuthUser;
};

export const UserMenu = ({ user }: UserMenuProps) => {
	const {
		open,
		toggle,
		close,
		containerRef,
		isAdmin,
		isReviewer,
		roleLabel,
		initials,
	} = useUserMenu(user);

	return (
		<div ref={containerRef} className="relative">
			<Button
				type="button"
				variant="ghost"
				className="h-10 gap-2 rounded-full py-1 pr-2 pl-1 sm:pr-3"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={toggle}
			>
				<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/15">
					{initials}
				</span>
				<span className="hidden min-w-0 flex-col items-start text-left leading-tight sm:flex">
					<span className="max-w-36 truncate text-sm font-medium">
						{user.name}
					</span>
					<span className="max-w-36 truncate text-[11px] font-normal text-muted-foreground">
						{roleLabel}
					</span>
				</span>
				<ChevronDown
					aria-hidden="true"
					className={cn(
						"hidden size-3.5 text-muted-foreground transition-transform sm:block",
						open && "rotate-180",
					)}
				/>
			</Button>

			{open ? (
				<div
					role="menu"
					aria-label="Account menu"
					className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
				>
					<div className="flex items-center gap-3 border-b p-3">
						<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
							{initials}
						</span>
						<div className="min-w-0">
							<p className="truncate text-sm font-medium">{user.name}</p>
							<p className="truncate text-xs text-muted-foreground">
								{user.email}
							</p>
						</div>
					</div>

					<div className="p-1">
						<div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground">
							<ShieldCheck className="size-3.5" aria-hidden="true" />
							Signed in as {roleLabel}
						</div>

						{isAdmin ? (
							<Link
								href="/admin"
								role="menuitem"
								className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
								onClick={close}
							>
								<LayoutDashboard className="size-4" aria-hidden="true" />
								Admin dashboard
							</Link>
						) : null}

						{isReviewer ? (
							<Link
								href="/reviewer"
								role="menuitem"
								className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
								onClick={close}
							>
								<ClipboardCheck className="size-4" aria-hidden="true" />
								Reviewer dashboard
							</Link>
						) : null}

						<form action={logoutAction}>
							<Button
								type="submit"
								variant="ghost"
								role="menuitem"
								className="w-full justify-start gap-2 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
							>
								<LogOut className="size-4" aria-hidden="true" />
								Sign out
							</Button>
						</form>
					</div>
				</div>
			) : null}
		</div>
	);
};
