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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type {
	AdminUser,
	UserEditField,
	UserRole,
	UserStatus,
} from "@/features/admin/types";
import { getRoleLabel, getUserStatusLabel } from "@/features/admin/utils";
import { Pencil, Save } from "lucide-react";
import { useEditUser } from "../hooks/useEditUser.hook";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
	{ value: "STUDENT", label: "Student" },
	{ value: "REVIEWER", label: "Reviewer" },
	{ value: "ADMIN", label: "Admin" },
];

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
	{ value: "ACTIVE", label: "Active" },
	{ value: "INACTIVE", label: "Inactive" },
	{ value: "BANNED", label: "Banned" },
];

type EditUserDialogProps = {
	user: AdminUser;
	currentUserId: string;
};

export const EditUserDialog = ({
	user,
	currentUserId,
}: EditUserDialogProps) => {
	const {
		open,
		handleOpenChange,
		showErrors,
		state,
		formAction,
		isPending,
		fieldError,
	} = useEditUser();
	const isSelf = user.id === currentUserId;
	const fieldId = (field: UserEditField) =>
		`admin-edit-user-${field}-${user.id}`;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<TableActionButton
				label="Edit user"
				aria-expanded={open}
				aria-haspopup="dialog"
				onClick={() => handleOpenChange(true)}
			>
				<Pencil className="size-3.5" aria-hidden="true" />
			</TableActionButton>

			<DialogContent>
				<DialogDismiss />

				<DialogHeader>
					<DialogTitle>Edit user</DialogTitle>
					<DialogDescription>
						Update account details and access for {user.name}.
					</DialogDescription>
				</DialogHeader>

				<form
					key={`${user.id}-${user.updatedAt}-${open}`}
					action={formAction}
					className="grid gap-4"
				>
					<input type="hidden" name="userId" value={user.id} />

					{showErrors && state.status === "error" && state.message ? (
						<p
							role="alert"
							className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
						>
							{state.message}
						</p>
					) : null}

					<div className="grid gap-1.5">
						<Label htmlFor={fieldId("name")}>Name</Label>
						<Input
							id={fieldId("name")}
							name="name"
							defaultValue={user.name}
							autoComplete="name"
							required
							minLength={2}
							maxLength={255}
							disabled={isPending}
							aria-invalid={Boolean(fieldError("name"))}
						/>
						{fieldError("name") ? (
							<p className="text-xs text-destructive">{fieldError("name")}</p>
						) : null}
					</div>

					<div className="grid gap-1.5">
						<Label htmlFor={fieldId("email")}>Email</Label>
						<Input
							id={fieldId("email")}
							name="email"
							type="email"
							defaultValue={user.email}
							autoComplete="email"
							required
							maxLength={254}
							disabled={isPending}
							aria-invalid={Boolean(fieldError("email"))}
						/>
						{fieldError("email") ? (
							<p className="text-xs text-destructive">{fieldError("email")}</p>
						) : null}
					</div>

					<div className="grid gap-1.5">
						<Label htmlFor={fieldId("role")}>Role</Label>
						<select
							id={fieldId("role")}
							name="role"
							defaultValue={user.role}
							disabled={isPending || isSelf}
							className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
							aria-invalid={Boolean(fieldError("role"))}
						>
							{ROLE_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<p className="text-xs text-muted-foreground">
							{isSelf
								? "You can update your own name and email, but not your role and status."
								: `Changing the role from ${getRoleLabel(user.role)} and status from ${getUserStatusLabel(user.status)} updates access immediately.`}
						</p>
						{fieldError("role") ? (
							<p className="text-xs text-destructive">{fieldError("role")}</p>
						) : null}
					</div>

					<div className="grid gap-1.5">
						<Label htmlFor={fieldId("status")}>Status</Label>
						<select
							id={fieldId("status")}
							name="status"
							defaultValue={user.status}
							disabled={isPending || isSelf}
							className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
							aria-invalid={Boolean(fieldError("status"))}
						>
							{STATUS_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<p className="text-xs text-muted-foreground">
							{isSelf
								? "You can update your own name and email, but not your role."
								: `Changing the status from ${getUserStatusLabel(user.status)} updates access immediately.`}
						</p>
						{fieldError("status") ? (
							<p className="text-xs text-destructive">{fieldError("status")}</p>
						) : null}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? (
								<>
									<Spinner />
									Saving…
								</>
							) : (
								<>
									<Save aria-hidden="true" />
									Save changes
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
