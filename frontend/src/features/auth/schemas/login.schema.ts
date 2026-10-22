import { emailSchema, loginPasswordSchema } from "@/validations";
import z from "zod";

export const loginSchema = z.object({
	email: emailSchema,
	password: loginPasswordSchema,
});
