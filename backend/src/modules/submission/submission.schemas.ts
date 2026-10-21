import { z } from "zod";
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

export const listSubmissionsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	status: submissionStatusSchema.optional(),
	studentId: z.string().trim().min(1).optional(),
});

export const listMySubmissionsQuerySchema = listSubmissionsQuerySchema.omit({
	studentId: true,
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;
export type ListMySubmissionsQuery = z.infer<
	typeof listMySubmissionsQuerySchema
>;
