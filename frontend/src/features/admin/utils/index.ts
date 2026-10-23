import type { UserRole, UserStatus } from "../types";

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Student",
  ADMIN: "Admin",
  REVIEWER: "Reviewer",
};

export const ROLE_STYLES: Record<UserRole, string> = {
  STUDENT: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-400",
  ADMIN:
    "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-400",
  REVIEWER:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BANNED: "Banned",
  DELETED: "Deleted",
};

export const USER_STATUS_STYLES: Record<UserStatus, string> = {
  ACTIVE:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  INACTIVE: "bg-muted text-muted-foreground ring-border",
  BANNED: "bg-destructive/10 text-destructive ring-destructive/20",
  DELETED: "bg-muted text-muted-foreground ring-border",
};

export const getRoleLabel = (role: string): string =>
  ROLE_LABELS[role as UserRole] ?? role;

export const getRoleStyle = (role: string): string =>
  ROLE_STYLES[role as UserRole] ?? "bg-muted text-muted-foreground ring-border";

export const getUserStatusLabel = (status: string): string =>
  USER_STATUS_LABELS[status as UserStatus] ?? status;

export const getUserStatusStyle = (status: string): string =>
  USER_STATUS_STYLES[status as UserStatus] ??
  "bg-muted text-muted-foreground ring-border";
