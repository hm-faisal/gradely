import type { z } from "zod";

/** Returns the first human-readable issue from a failed Zod parse. */
export function firstIssueMessage(error: z.ZodError): string | undefined {
  return error.issues[0]?.message;
}

/**
 * Runs a Zod schema and returns the first issue message, or `undefined` when
 * the value is valid. TanStack Form's field validators expect this shape.
 */
export function validateWith(
  schema: z.ZodType,
  value: unknown,
): string | undefined {
  const result = schema.safeParse(value);

  return result.success ? undefined : firstIssueMessage(result.error);
}
