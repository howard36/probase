import { describe, expect, it } from "vitest";
import { z } from "zod";
import { formDataToObject, idSchema, parseInput } from "@/lib/validation";

describe("parseInput", () => {
  const schema = z.object({ problemId: idSchema, like: z.boolean() });

  it("returns the parsed data on success", () => {
    expect(parseInput(schema, { problemId: 3, like: true })).toEqual({
      ok: true,
      data: { problemId: 3, like: true },
    });
  });

  it("returns an ActionResponse error naming the first bad field", () => {
    const result = parseInput(schema, { problemId: "3", like: true });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/^Invalid input \(problemId\): /);
    }
  });

  it("rejects ids that are not positive integers", () => {
    for (const bad of [0, -1, 1.5, NaN, "1", null, undefined]) {
      expect(parseInput(idSchema, bad).ok).toBe(false);
    }
    expect(parseInput(idSchema, 1)).toEqual({ ok: true, data: 1 });
  });

  it("describes a bad top-level value without a path", () => {
    const result = parseInput(z.string().min(1), "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/^Invalid input: /);
    }
  });
});

describe("formDataToObject", () => {
  it("keeps string fields and drops files", () => {
    const form = new FormData();
    form.set("title", "Sum");
    form.set("answer", "");
    form.set("upload", new Blob(["x"]), "x.txt");

    expect(formDataToObject(form)).toEqual({ title: "Sum", answer: "" });
  });
});
