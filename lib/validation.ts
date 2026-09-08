import { z } from "zod";
import { type ActionResponse, error } from "@/lib/server-actions";

/** A positive integer database id. */
export const idSchema = z.number().int().positive();

/**
 * Validates a server action's raw arguments. Server actions can be called
 * with anything, so every action parses its input first and returns the
 * failure to the caller as an ordinary ActionResponse error.
 */
export function parseInput<T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  value: unknown,
): ActionResponse<T> {
  const result = schema.safeParse(value);
  if (result.success) {
    return { ok: true, data: result.data } as ActionResponse<T>;
  }
  const issue = result.error.issues[0];
  const where = issue.path.length > 0 ? ` (${issue.path.join(".")})` : "";
  return error(`Invalid input${where}: ${issue.message}`);
}

/** The string fields of a FormData, for validating with an object schema. */
export function formDataToObject(formData: FormData): Record<string, string> {
  const object: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      object[key] = value;
    }
  });
  return object;
}
