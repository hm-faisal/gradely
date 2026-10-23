import { repoHosts } from "@/constants/repo-hosts.constants";
import { z } from "zod";

const projectNameSchema = z
	.string({ error: "Project name must be a string" })
	.trim()
	.min(3, { error: "Project name must be at least 3 characters" })
	.max(255, { error: "Project name must be at most 255 characters" });

const descriptionSchema = z
	.string({ error: "Description must be a string" })
	.trim()
	.min(10, { error: "Description must be at least 10 characters" })
	.max(5000, { error: "Description must be at most 5000 characters" });

const urlSchema = (field: string) =>
	z
		.string({ error: `${field} must be a string` })
		.trim()
		.min(1, { error: `${field} is required` })
		.max(2048, { error: `${field} must be at most 2048 characters` })
		.pipe(z.url({ error: `${field} must be a valid URL` }))
		.refine((value) => /^https?:\/\//i.test(value), {
			error: `${field} must start with http:// or https://`,
		});

const repoHostSchema = z.enum(repoHosts);

const repoUrlSchema = z.url().refine(
	(value) => {
		const url = new URL(value);

		return (
			url.protocol === "https:" &&
			repoHostSchema.safeParse(url.hostname).success
		);
	},
	`Repository must be hosted on one of the following platforms: ${repoHosts.join(", ")}`,
);

export const createSubmissionSchema = z.object({
	projectName: projectNameSchema,
	repoUrl: repoUrlSchema,
	liveLink: urlSchema("Live link"),
	description: descriptionSchema,
});
