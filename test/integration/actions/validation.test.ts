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
      addSolution(problem.id, ""),
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
      const { collection } = await member();

      const result = await addProblem(
        collection.id,
        form({ ...valid, subject: "Chemistry" }),
      );

      expect(result.ok).toBe(false);
      expect(await prisma.problem.count()).toBe(0);
    });

    it("rejects an empty title and a difficulty outside 1-5", async () => {
      const { collection } = await member();

      expect(
        (await addProblem(collection.id, form({ ...valid, title: "" }))).ok,
      ).toBe(false);
      expect(
        (await addProblem(collection.id, form({ ...valid, difficulty: "7" })))
          .ok,
      ).toBe(false);
      expect(await prisma.problem.count()).toBe(0);
    });

    it("stores an empty difficulty as null and an empty answer as an empty string", async () => {
      const { collection } = await member();

      await expectRedirect(
        addProblem(
          collection.id,
          form({
            ...valid,
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

    it("attributes the problem to the submitter's own author, whatever the form says", async () => {
      const { collection, author } = await member();
      const other = await createAuthor(collection);

      await expectRedirect(
        addProblem(
          collection.id,
          form({ ...valid, authorId: String(other.id) }),
        ),
        `/c/${collection.cid}/p/A1`,
      );

      const problem = await prisma.problem.findFirstOrThrow({
        include: { authors: true },
      });
      expect(problem.authors.map((a) => a.id)).toEqual([author.id]);
    });
  });

  describe("addSolution", () => {
    it("attributes the solution to the member's own author", async () => {
      const { collection, author } = await member();
      const problem = await createProblem(collection);
      await createAuthor(collection);

      expect(await addSolution(problem.id, "Proof")).toEqual({ ok: true });

      const solution = await prisma.solution.findFirstOrThrow({
        include: { authors: true },
      });
      expect(solution.authors.map((a) => a.id)).toEqual([author.id]);
    });
  });
});
