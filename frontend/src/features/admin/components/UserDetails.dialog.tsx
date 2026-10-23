"use client";

import { TableActionButton } from "@/components/tables/TableAction";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogDismiss,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { AdminUser, UserRole } from "@/features/admin/types";
import {
	getRoleLabel,
	getRoleStyle,
	getUserStatusLabel,
	getUserStatusStyle,
} from "@/features/admin/utils";
import { formatDate } from "@/utils/utils";
import { Eye, ShieldCheck } from "lucide-react";
import { useUserDetails } from "../hooks/useUserDetails.hook";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
	{ value: "STUDENT", label: "Student" },
	{ value: "REVIEWER", label: "Reviewer" },
	{ value: "ADMIN", label: "Admin" },
];

type UserDetailsDialogProps = {
	user: AdminUser;
	currentUserId: string;
};

export const UserDetailsDialog = ({
	user,
	currentUserId,
}: UserDetailsDialogProps) => {
	const { open, setOpen, state, formAction, isPending } = useUserDetails();

	const isSelf = user.id === currentUserId;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<TableActionButton
				label="View user details"
				aria-expanded={open}
				aria-haspopup="dialog"
				onClick={() => setOpen(true)}
			>
				<Eye className="size-3.5" aria-hidden="true" />
			</TableActionButton>

			<DialogContent>
				<DialogDismiss />

				<DialogHeader>
					<DialogTitle>{user.name}</DialogTitle>
					<DialogDescription>{user.email}</DialogDescription>
				</DialogHeader>

				<div className="flex flex-wrap items-center gap-2">
					<span
						className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getRoleStyle(user.role)}`}
					>
						{getRoleLabel(user.role)}
					</span>
					<span
						className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getUserStatusStyle(user.status)}`}
					>
						{getUserStatusLabel(user.status)}
					</span>
				</div>

				<dl className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
					<div>
						<dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
							Joined
						</dt>
						<dd className="mt-0.5">{formatDate(user.createdAt)}</dd>
					</div>
					<div>
						<dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
							Last updated
						</dt>
						<dd className="mt-0.5">{formatDate(user.updatedAt)}</dd>
					</div>
					<div className="sm:col-span-2">
						<dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
							User ID
						</dt>
						<dd className="mt-0.5 font-mono text-xs break-all text-muted-foreground">
							{user.id}
						</dd>
					</div>
				</dl>

				<form action={formAction} className="grid gap-3">
					<input type="hidden" name="userId" value={user.id} />

					<div className="grid gap-1.5">
						<Label htmlFor={`user-role-${user.id}`}>Role</Label>
						<select
							id={`user-role-${user.id}`}
							name="role"
							defaultValue={user.role}
							disabled={isPending || isSelf}
							className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{ROLE_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<p className="text-xs text-muted-foreground">
							{isSelf
								? "You cannot change your own role."
								: "Changing the role updates this user's access immediately."}
						</p>
					</div>

					{state.status === "error" && state.message ? (
						<p
							role="alert"
							className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
						>
							{state.message}
						</p>
					) : null}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending}
						>
							Close
						</Button>
						<Button type="submit" disabled={isPending || isSelf}>
							{isPending ? (
								<>
									<Spinner />
									Saving…
								</>
							) : (
								<>
									<ShieldCheck aria-hidden="true" />
									Save role
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
