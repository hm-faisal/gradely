import { z } from "zod";

export const reviewSubmissionSchema = z
  .object({
    submissionId: z.string().trim().min(1, "Submission is required"),
    status: z.enum(["APPROVED", "REJECTED"], {
      error: "Choose whether to approve or reject the submission",
    }),
    feedback: z
      .string()
      .trim()
      .max(2000, "Feedback must be at most 2000 characters")
      .optional(),
  })
  .superRefine((data, context) => {
    if (data.status !== "REJECTED") return;

    if (!data.feedback) {
      context.addIssue({
        code: "custom",
        path: ["feedback"],
        message: "Feedback is required when rejecting a submission",
      });
      return;
    }

    if (data.feedback.length < 3) {
      context.addIssue({
        code: "custom",
        path: ["feedback"],
        message: "Feedback must be at least 3 characters",
      });
    }
  })
  .transform((data) => ({
    ...data,
    feedback: data.feedback || undefined,
  }));

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
