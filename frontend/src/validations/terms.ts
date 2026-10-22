import { z } from "zod";
import { validateWith } from "./utils";

export const termsSchema = z
  .boolean({ error: "Please accept the terms to continue" })
  .refine((value) => value, {
    error: "Please accept the terms to continue",
  });

export function validateTerms(value: boolean): string | undefined {
  return validateWith(termsSchema, value);
}
