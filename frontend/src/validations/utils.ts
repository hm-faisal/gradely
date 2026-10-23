import type { z } from "zod";

export function firstIssueMessage(error: z.ZodError): string | undefined {
  return error.issues[0]?.message;
}

export function validateWith(
  schema: z.ZodType,
  value: unknown,
): string | undefined {
  const result = schema.safeParse(value);

  return result.success ? undefined : firstIssueMessage(result.error);
}
