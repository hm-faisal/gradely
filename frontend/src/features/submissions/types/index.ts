import type { PaginationMeta } from "@/types/pagination";

export const SUBMISSION_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export type SubmissionPerson = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Submission = {
  id: string;
  projectName: string;
  repoUrl: string;
  liveLink: string;
  description: string;
  status: SubmissionStatus;
  feedback: string | null;
  studentId: string;
  reviewerId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  student?: SubmissionPerson | null;
  reviewer?: SubmissionPerson | null;
};

export type SubmissionMeta = PaginationMeta;

export type CreateSubmissionField =
  | "projectName"
  | "repoUrl"
  | "liveLink"
  | "description";

export type CreateSubmissionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<CreateSubmissionField, string>>;
};
