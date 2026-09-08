import { describe, expect, it } from "vitest";
import { addProblem } from "@/app/c/[cid]/add-problem/actions";
import {
  addSolution,
  editProblem,
  likeProblem,
  submitTestsolve,
} from "@/app/c/[cid]/p/[pid]/actions";
import { setTestsolverType } from "@/app/c/[cid]/choose-testsolver-type/actions";
import { acceptInvite } from "@/app/invite/[code]/actions";
import prisma from "@/lib/prisma";
import {
  createAuthor,
  createCollection,
  createPermission,
  createProblem,
  createUser,
} from "../factories";
import { expectRedirect } from "../navigation";
import { signInAs } from "../session";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

async function member(accessLevel: "Admin" | "TeamMember" = "TeamMember") {
  const collection = await createCollection();
  const user = await createUser();
  await createPermission(user, collection, accessLevel);
  const author = await createAuthor(collection, { userId: user.id });
  signInAs(user);
  return { collection, user, author };
}

// Server actions can be called with anything; the schema is the first line.
describe("action input validation", () => {
  it("rejects malformed arguments before touching the database", async () => {
    const { collection } = await member();
    const problem = await createProblem(collection);

    const bad = [
      likeProblem("1" as unknown as number, true),
      likeProblem(problem.id, "yes" as unknown as boolean),
      editProblem(problem.id, { title: "" }),
      editProblem(problem.id, { isArchived: "no" as unknown as boolean }),
      submitTestsolve(problem.id, 42 as unknown as string),
      addSolution(problem.id, "", 1),
      setTestsolverType(collection.id, "Hardcore" as "Serious"),
      acceptInvite(""),
    ];
    for (const result of await Promise.all(bad)) {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toMatch(/^Invalid input/);
      }
    }
  });

  describe("addProblem", () => {
    const valid = {
      title: "Sum",
      subject: "Algebra",
      statement: "Add them.",
      answer: "3",
      solution: "",
      difficulty: "2",
    };

    it("rejects an unknown subject instead of generating pid 'undefined1'", async () => {
      const { collection, author } = await member();

      const result = await addProblem(
        collection.id,
        form({ ...valid, subject: "Chemistry", authorId: String(author.id) }),
      );

      expect(result.ok).toBe(false);
      expect(await prisma.problem.count()).toBe(0);
    });

    it("rejects an empty title and a difficulty outside 1-5", async () => {
      const { collection, author } = await member();
      const authorId = String(author.id);

      expect(
        (
          await addProblem(
            collection.id,
            form({ ...valid, authorId, title: "" }),
          )
        ).ok,
      ).toBe(false);
      expect(
        (
          await addProblem(
            collection.id,
            form({ ...valid, authorId, difficulty: "7" }),
          )
        ).ok,
      ).toBe(false);
      expect(await prisma.problem.count()).toBe(0);
    });

    it("stores an empty difficulty as null and an empty answer as an empty string", async () => {
      const { collection, author } = await member();

      await expectRedirect(
        addProblem(
          collection.id,
          form({
            ...valid,
            authorId: String(author.id),
            difficulty: "",
            answer: "",
          }),
        ),
        `/c/${collection.cid}/p/A1`,
      );

      const problem = await prisma.problem.findFirstOrThrow();
      expect(problem.difficulty).toBeNull();
      expect(problem.answer).toBe("");
    });

    it("refuses to attribute the problem to someone else's author", async () => {
      const { collection } = await member();
      const other = await createAuthor(collection);

      const result = await addProblem(
        collection.id,
        form({ ...valid, authorId: String(other.id) }),
      );

      expect(result).toEqual({
        ok: false,
        error: { message: "Invalid input (authorId): not one of your authors" },
      });
      expect(await prisma.problem.count()).toBe(0);
    });
  });

  describe("addSolution", () => {
    it("refuses to attribute the solution to someone else's author", async () => {
      const { collection } = await member();
      const problem = await createProblem(collection);
      const other = await createAuthor(collection);

      const result = await addSolution(problem.id, "Proof", other.id);

      expect(result.ok).toBe(false);
      expect(await prisma.solution.count()).toBe(0);
    });
  });
});
