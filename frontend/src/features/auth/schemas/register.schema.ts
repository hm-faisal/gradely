import { emailSchema, nameSchema, passwordSchema } from "@/validations";
import z from "zod";

export const registerSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	password: passwordSchema,
});
