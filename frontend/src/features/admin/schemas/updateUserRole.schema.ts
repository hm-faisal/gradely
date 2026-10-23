import { z } from "zod";

export const updateUserRoleSchema = z.object({
	userId: z.string().trim().min(1, { error: "User id is required" }),
	role: z.enum(["STUDENT", "ADMIN", "REVIEWER"], {
		error: "Choose a valid role",
	}),
});
