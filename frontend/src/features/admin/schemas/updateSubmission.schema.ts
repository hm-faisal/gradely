import { createSubmissionSchema } from "@/features/submissions/schemas/createSubmission.schema";
import { z } from "zod";

export const updateSubmissionSchema = createSubmissionSchema.extend({
	submissionId: z
		.string()
		.trim()
		.min(1, { error: "Submission id is required" }),
});
