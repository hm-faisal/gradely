import { z } from "zod";
import {
	booleanQuerySchema,
	createPaginationSchema,
} from "../../schemas/pagination.schema";
import { createStringSchema } from "../../schemas/string.schema";
import { sanitizeString } from "../../utils/sanitize";

const projectNameSchema = createStringSchema({
	min: 3,
	max: 255,
	field: "Project name",
});

const descriptionSchema = createStringSchema({
	min: 10,
	max: 5000,
	field: "Description",
});

const feedbackSchema = createStringSchema({
	min: 3,
	max: 2000,
	field: "Feedback",
});

const urlSchema = (field: string) =>
	z
		.string({ error: `${field} must be a string` })
		.max(2048, { error: `${field} must be at most 2048 characters` })
		.transform((value) => sanitizeString(value))
		.pipe(z.url({ error: `${field} must be a valid URL` }))
		.refine((value) => /^https?:\/\//i.test(value), {
			error: `${field} must start with http:// or https://`,
		});

const repoUrlSchema = urlSchema("Repository URL");
const liveLinkSchema = urlSchema("Live link");

export const submissionStatusSchema = z.enum([
	"PENDING",
	"APPROVED",
	"REJECTED",
]);

export const createSubmissionSchema = z.object({
	projectName: projectNameSchema,
	repoUrl: repoUrlSchema,
	liveLink: liveLinkSchema,
	description: descriptionSchema,
});

export const updateSubmissionSchema = z
	.object({
		projectName: projectNameSchema.optional(),
		repoUrl: repoUrlSchema.optional(),
		liveLink: liveLinkSchema.optional(),
		description: descriptionSchema.optional(),
	})
	.refine(
		(data) =>
			data.projectName !== undefined ||
			data.repoUrl !== undefined ||
			data.liveLink !== undefined ||
			data.description !== undefined,
		{ error: "At least one field must be provided" },
	);

export const reviewSubmissionSchema = z
	.object({
		status: z.enum(["APPROVED", "REJECTED"], {
			error: "Status must be either APPROVED or REJECTED",
		}),
		feedback: feedbackSchema.optional(),
	})
	.refine((data) => data.status !== "REJECTED" || data.feedback !== undefined, {
		error: "Feedback is required when rejecting a submission",
		path: ["feedback"],
	});

export const assignReviewerSchema = z.object({
	reviewerId: z
		.string({ error: "Reviewer is required" })
		.trim()
		.min(1, { error: "Reviewer is required" }),
});

export const listSubmissionsQuerySchema = createPaginationSchema(10).extend({
	status: submissionStatusSchema.optional(),
	studentId: z.string().trim().min(1).optional(),
	reviewerId: z.string().trim().min(1).optional(),
	/** Only submissions that have (or have not) been reviewed. */
	reviewed: booleanQuerySchema.optional(),
	/** Only submissions with (or without) feedback attached. */
	hasFeedback: booleanQuerySchema.optional(),
	/** Only pending submissions with (or without) an assigned reviewer. */
	unassigned: booleanQuerySchema.optional(),
});

export const listMySubmissionsQuerySchema = createPaginationSchema(10).extend({
	status: submissionStatusSchema.optional(),
	reviewed: booleanQuerySchema.optional(),
	hasFeedback: booleanQuerySchema.optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type AssignReviewerInput = z.infer<typeof assignReviewerSchema>;
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;
export type ListMySubmissionsQuery = z.infer<
	typeof listMySubmissionsQuerySchema
>;
