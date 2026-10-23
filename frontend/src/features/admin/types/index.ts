import type {
  Submission,
  SubmissionPerson,
  SubmissionStatus,
} from "@/features/submissions/types";
import type { PaginationMeta } from "@/types/pagination";
import type { MonthlyActivity } from "@/utils/utils";

export const USER_ROLES = ["STUDENT", "ADMIN", "REVIEWER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "BANNED",
  "DELETED",
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const EDITABLE_USER_STATUSES = ["ACTIVE", "INACTIVE", "BANNED"] as const;

export type EditableUserStatus = (typeof EDITABLE_USER_STATUSES)[number];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserCounts = {
  submissions: number;
  reviews: number;
  feedbacks: number;
};

export type AdminUserDetails = AdminUser & {
  counts: AdminUserCounts;
};

export type AdminFeedbackSubmission = {
  id: string;
  projectName: string;
  status: SubmissionStatus;
  studentId: string;
  repoUrl: string;
  liveLink: string;
  description: string;
  createdAt: string;
  reviewedAt: string | null;
  student: SubmissionPerson | null;
};

export type AdminFeedback = {
  id: string;
  content: string;
  submissionId: string;
  reviewerId: string;
  createdAt: string;
  updatedAt: string;
  reviewer: SubmissionPerson | null;
  submission: AdminFeedbackSubmission;
};

export type AdminSummary = {
  users: {
    total: number;
    students: number;
    admins: number;
    reviewers: number;
  };
  submissions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    monthly: MonthlyActivity[];
  };
  feedbacks: {
    total: number;
  };
};

export type AdminMeta = PaginationMeta;

export type AdminSubmission = Submission;

export type ReviewerField = "name" | "email" | "password";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ReviewerField, string>>;
};

export type UserEditField = "name" | "email" | "role" | "status";

export type UpdateUserState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<UserEditField, string>>;
};

export type FeedbackEditField = "content";

export type UpdateFeedbackState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<FeedbackEditField, string>>;
};

export type AssignReviewerActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    reviewerId?: string;
  };
};

export type AutoAssignResult = {
  assigned: number;
  reviewers: number;
  assignments: { submissionId: string; reviewerId: string }[];
};
