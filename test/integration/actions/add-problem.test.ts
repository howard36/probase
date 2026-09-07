import { revalidateTag } from "next/cache";
import { describe, expect, it } from "vitest";
import { addProblem } from "@/app/c/[cid]/add-problem/actions";
import prisma from "@/lib/prisma";
import { error } from "@/lib/server-actions";
import {
  createAuthor,
  createCollection,
  createPermission,
  createProblem,
  createUser,
} from "../factories";
import { expectRedirect } from "../navigation";
import { signInAs, signOut } from "../session";

function problemForm(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.set(key, value);
  }
  return form;
}

async function setup(accessLevel: "Admin" | "TeamMember" | "SubmitOnly") {
  const collection = await createCollection();
  const user = await createUser();
  await createPermission(user, collection, accessLevel);
  const author = await createAuthor(collection, { userId: user.id });
  signInAs(user);
  const fields = {
    title: "Sum of squares",
    subject: "Algebra",
    statement: "Find $1^2 + 2^2$.",
    answer: "5",
    solution: "",
    authorId: String(author.id),
    difficulty: "3",
  };
  return { collection, user, author, fields };
}

describe("addProblem", () => {
  it("rejects a signed-out user", async () => {
    signOut();

    expect(await addProblem(1, problemForm({}))).toEqual(
      error("Not signed in"),
    );
  });

  it("rejects an unknown collection", async () => {
    const { fields } = await setup("Admin");

    expect(await addProblem(999, problemForm(fields))).toEqual(
      error("Collection not found"),
    );
  });

  it("rejects a user without permission on the collection", async () => {
    const { collection, fields } = await setup("Admin");
    const stranger = await createUser();
    signInAs(stranger);

    expect(await addProblem(collection.id, problemForm(fields))).toEqual(
      error("You do not have permission to add a problem"),
    );
    expect(await prisma.problem.count()).toBe(0);
  });

  it("rejects a ViewOnly user", async () => {
    const { collection, fields } = await setup("Admin");
    const viewer = await createUser();
    await createPermission(viewer, collection, "ViewOnly");
    signInAs(viewer);

    expect(await addProblem(collection.id, problemForm(fields))).toEqual(
      error("You do not have permission to add a problem"),
    );
  });

  it.each(["Admin", "TeamMember", "SubmitOnly"] as const)(
    "lets a %s add a problem and redirects to it",
    async (level) => {
      const { collection, fields } = await setup(level);

      await expectRedirect(
        addProblem(collection.id, problemForm(fields)),
        `/c/${collection.cid}/p/A1`,
      );
      expect(await prisma.problem.count()).toBe(1);
    },
  );

  it("stores every field, attributes the author, and self-likes", async () => {
    const { collection, user, author, fields } = await setup("TeamMember");

    await expectRedirect(
      addProblem(collection.id, problemForm(fields)),
      `/c/${collection.cid}/p/A1`,
    );

    const problem = await prisma.problem.findUniqueOrThrow({
      where: { collectionId_pid: { collectionId: collection.id, pid: "A1" } },
      include: { authors: true, solutions: true, likes: true },
    });
    expect(problem).toMatchObject({
      title: "Sum of squares",
      subject: "Algebra",
      statement: "Find $1^2 + 2^2$.",
      answer: "5",
      difficulty: 3,
      isAnonymous: false,
      isArchived: false,
      submitterId: user.id,
    });
    expect(problem.authors.map((a) => a.id)).toEqual([author.id]);
    expect(problem.solutions).toEqual([]);
    expect(problem.likes).toEqual([{ userId: user.id, problemId: problem.id }]);
    expect(revalidateTag).toHaveBeenCalledWith(
      `collection/${collection.cid}/problems`,
    );
  });

  it("creates a solution by the same author when one is given", async () => {
    const { collection, author, fields } = await setup("TeamMember");

    await expectRedirect(
      addProblem(
        collection.id,
        problemForm({ ...fields, solution: "$1 + 4 = 5$." }),
      ),
      `/c/${collection.cid}/p/A1`,
    );

    const solutions = await prisma.solution.findMany({
      include: { authors: true },
    });
    expect(solutions).toHaveLength(1);
    expect(solutions[0].text).toBe("$1 + 4 = 5$.");
    expect(solutions[0].authors.map((a) => a.id)).toEqual([author.id]);
  });

  describe("problem id generation", () => {
    it("numbers each subject independently from 1", async () => {
      const { collection, fields } = await setup("Admin");

      await expectRedirect(
        addProblem(
          collection.id,
          problemForm({ ...fields, subject: "Algebra" }),
        ),
        `/c/${collection.cid}/p/A1`,
      );
      await expectRedirect(
        addProblem(
          collection.id,
          problemForm({ ...fields, subject: "NumberTheory" }),
        ),
        `/c/${collection.cid}/p/N1`,
      );
      await expectRedirect(
        addProblem(
          collection.id,
          problemForm({ ...fields, subject: "Combinatorics" }),
        ),
        `/c/${collection.cid}/p/C1`,
      );
      await expectRedirect(
        addProblem(
          collection.id,
          problemForm({ ...fields, subject: "Geometry" }),
        ),
        `/c/${collection.cid}/p/G1`,
      );
      await expectRedirect(
        addProblem(
          collection.id,
          problemForm({ ...fields, subject: "Algebra" }),
        ),
        `/c/${collection.cid}/p/A2`,
      );
    });

    it("increments the most recently created id in the subject", async () => {
      const { collection, fields } = await setup("Admin");
      await createProblem(collection, { pid: "A7", subject: "Algebra" });
      await createProblem(collection, { pid: "A9", subject: "Algebra" });

      await expectRedirect(
        addProblem(collection.id, problemForm(fields)),
        `/c/${collection.cid}/p/A10`,
      );
    });

    it("does not look at other collections", async () => {
      const { collection, fields } = await setup("Admin");
      const other = await createCollection();
      await createProblem(other, { pid: "A5", subject: "Algebra" });

      await expectRedirect(
        addProblem(collection.id, problemForm(fields)),
        `/c/${collection.cid}/p/A1`,
      );
    });
  });
});
