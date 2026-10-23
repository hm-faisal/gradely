import { z } from "zod";
import { validateWith } from "./utils";

export const nameSchema = z
  .string({ error: "Name is required" })
  .trim()
  .min(1, { error: "Name is required" })
  .min(2, { error: "Name must be at least 2 characters" })
  .max(255, { error: "Name must be at most 255 characters" });

export function validateName(value: string): string | undefined {
  return validateWith(nameSchema, value);
}
