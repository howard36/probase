import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import {
  addComment,
  addSolution,
  editProblem,
  editSolution,
  likeProblem,
} from "@/app/c/[cid]/p/[pid]/actions";
import prisma from "@/lib/prisma";
import { error } from "@/lib/server-actions";
import {
  createAuthor,
  createCollection,
  createPermission,
  createProblem,
  createSolution,
  createUser,
} from "../factories";
import { signInAs, signOut } from "../session";

describe("likeProblem", () => {
  it("rejects a signed-out user", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    signOut();

    expect(await likeProblem(problem.id, true)).toEqual(error("Not signed in"));
  });

  it("rejects an unknown problem", async () => {
    const user = await createUser();
    signInAs(user);

    expect(await likeProblem(999, true)).toEqual(
      error("No problem with id 999"),
    );
  });

  it("rejects a user without permission on the collection", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const user = await createUser();
    signInAs(user);

    expect(await likeProblem(problem.id, true)).toEqual(
      error("You do not have permission to like this problem"),
    );
    expect(await prisma.problemLike.count()).toBe(0);
  });

  it("rejects a SubmitOnly user, who cannot view the collection", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const user = await createUser();
    await createPermission(user, collection, "SubmitOnly");
    signInAs(user);

    expect((await likeProblem(problem.id, true)).ok).toBe(false);
  });

  it("lets a ViewOnly user like, then unlike, a problem", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const user = await createUser();
    await createPermission(user, collection, "ViewOnly");
    signInAs(user);

    expect(await likeProblem(problem.id, true)).toEqual({ ok: true });
    expect(await prisma.problemLike.findMany()).toEqual([
      { userId: user.id, problemId: problem.id },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith(
      `/c/${collection.cid}/p/${problem.pid}`,
    );

    expect(await likeProblem(problem.id, false)).toEqual({ ok: true });
    expect(await prisma.problemLike.count()).toBe(0);
  });

  it("is idempotent when liking twice", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const user = await createUser();
    await createPermission(user, collection);
    signInAs(user);

    expect(await likeProblem(problem.id, true)).toEqual({ ok: true });
    expect(await likeProblem(problem.id, true)).toEqual({ ok: true });
    expect(await prisma.problemLike.count()).toBe(1);
  });

  it("still succeeds when unliking a problem that was never liked", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const user = await createUser();
    await createPermission(user, collection);
    signInAs(user);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(await likeProblem(problem.id, false)).toEqual({ ok: true });
    // The missing row is logged, not surfaced.
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});

describe("editProblem", () => {
  it("rejects a signed-out user", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection, { title: "Before" });
    signOut();

    expect(await editProblem(problem.id, { title: "After" })).toEqual(
      error("Not signed in"),
    );
    const after = await prisma.problem.findUniqueOrThrow({
      where: { id: problem.id },
    });
    expect(after.title).toBe("Before");
  });

  it("rejects an unknown problem", async () => {
    signInAs(await createUser());

    expect(await editProblem(12345, { title: "x" })).toEqual(
      error("No problem with id 12345"),
    );
  });

  it("lets an Admin edit any problem and only touches the given fields", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection, {
      title: "Old title",
      statement: "Old statement",
      answer: "Old answer",
    });
    const admin = await createUser();
    await createPermission(admin, collection, "Admin");
    signInAs(admin);

    expect(
      await editProblem(problem.id, { statement: "New statement" }),
    ).toEqual({ ok: true });

    const after = await prisma.problem.findUniqueOrThrow({
      where: { id: problem.id },
    });
    expect(after).toMatchObject({
      title: "Old title",
      statement: "New statement",
      answer: "Old answer",
      isArchived: false,
    });
    expect(revalidatePath).toHaveBeenCalledWith(
      `/c/${collection.cid}/p/${problem.pid}`,
    );
  });

  it.each([
    ["Integer", "$42$", "The answer must be a whole number, like 42 or -7."],
    ["AIME", "1000", "The answer must be a whole number from 0 to 999."],
  ] as const)(
    "refuses an answer a %s collection's answer box could not type",
    async (answerFormat, answer, message) => {
      const collection = await createCollection({ answerFormat });
      const problem = await createProblem(collection, { answer: "42" });
      const admin = await createUser();
      await createPermission(admin, collection, "Admin");
      signInAs(admin);

      expect(await editProblem(problem.id, { answer })).toEqual(error(message));
      const after = await prisma.problem.findUniqueOrThrow({
        where: { id: problem.id },
      });
      expect(after.answer).toBe("42");
    },
  );

  it("takes any answer in a ShortAnswer collection, and an empty one anywhere", async () => {
    const shortAnswer = await createCollection({ answerFormat: "ShortAnswer" });
    const integer = await createCollection({ answerFormat: "Integer" });
    const free = await createProblem(shortAnswer);
    const whole = await createProblem(integer);
    const admin = await createUser();
    await createPermission(admin, shortAnswer, "Admin");
    await createPermission(admin, integer, "Admin");
    signInAs(admin);

    expect(await editProblem(free.id, { answer: "$\\sqrt{2}$" })).toEqual({
      ok: true,
    });
    expect(await editProblem(whole.id, { answer: "" })).toEqual({ ok: true });
    expect(await editProblem(whole.id, { answer: "-7" })).toEqual({ ok: true });
  });

  it("lets a TeamMember edit only problems they authored", async () => {
    const collection = await createCollection();
    const member = await createUser();
    await createPermission(member, collection, "TeamMember");
    const memberAuthor = await createAuthor(collection, { userId: member.id });
    const otherAuthor = await createAuthor(collection);
    const own = await createProblem(collection, {
      authorIds: [memberAuthor.id],
    });
    const theirs = await createProblem(collection, {
      authorIds: [otherAuthor.id],
    });
    signInAs(member);

    expect(await editProblem(own.id, { title: "Mine" })).toEqual({ ok: true });
    expect(await editProblem(theirs.id, { title: "Not mine" })).toEqual(
      error("You do not have permission to edit this problem"),
    );
  });

  it("never lets a ViewOnly user edit, even their own problem", async () => {
    const collection = await createCollection();
    const viewer = await createUser();
    await createPermission(viewer, collection, "ViewOnly");
    const author = await createAuthor(collection, { userId: viewer.id });
    const problem = await createProblem(collection, {
      authorIds: [author.id],
    });
    signInAs(viewer);

    expect((await editProblem(problem.id, { title: "x" })).ok).toBe(false);
  });

  it("can archive and unarchive", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const admin = await createUser();
    await createPermission(admin, collection, "Admin");
    signInAs(admin);

    await editProblem(problem.id, { isArchived: true });
    expect(
      (await prisma.problem.findUniqueOrThrow({ where: { id: problem.id } }))
        .isArchived,
    ).toBe(true);

    await editProblem(problem.id, { isArchived: false });
    expect(
      (await prisma.problem.findUniqueOrThrow({ where: { id: problem.id } }))
        .isArchived,
    ).toBe(false);
  });
});

function commentForm(text?: string): FormData {
  const form = new FormData();
  if (text !== undefined) {
    form.set("comment", text);
  }
  return form;
}

describe("addComment", () => {
  it("rejects a form without a comment field", async () => {
    signInAs(await createUser());

    expect(await addComment(1, commentForm())).toEqual(error("Text is null"));
  });

  it("rejects a signed-out user", async () => {
    signOut();

    expect(await addComment(1, commentForm("hi"))).toEqual(
      error("Not signed in"),
    );
  });

  it("rejects an unknown problem", async () => {
    signInAs(await createUser());

    expect(await addComment(999, commentForm("hi"))).toEqual(
      error("Problem not found"),
    );
  });

  it("rejects a user without permission", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const user = await createUser();
    signInAs(user);

    expect(await addComment(problem.id, commentForm("hi"))).toEqual(
      error("You do not have permission to comment on this problem"),
    );
    expect(await prisma.comment.count()).toBe(0);
  });

  it("lets any role, including ViewOnly and SubmitOnly, comment", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const viewer = await createUser();
    await createPermission(viewer, collection, "ViewOnly");
    const submitter = await createUser();
    await createPermission(submitter, collection, "SubmitOnly");

    signInAs(viewer);
    expect(await addComment(problem.id, commentForm("first"))).toEqual({
      ok: true,
    });
    signInAs(submitter);
    expect(await addComment(problem.id, commentForm("second"))).toEqual({
      ok: true,
    });

    const comments = await prisma.comment.findMany({ orderBy: { id: "asc" } });
    expect(comments).toMatchObject([
      { text: "first", userId: viewer.id, problemId: problem.id },
      { text: "second", userId: submitter.id, problemId: problem.id },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith(
      `/c/${collection.cid}/p/${problem.pid}`,
    );
  });
});

describe("addSolution", () => {
  it("rejects a signed-out user", async () => {
    signOut();

    expect(await addSolution(1, "text")).toEqual(error("Not signed in"));
  });

  it("rejects an unknown problem", async () => {
    signInAs(await createUser());

    expect(await addSolution(999, "text")).toEqual(error("Problem not found"));
  });

  it.each(["ViewOnly", "SubmitOnly"] as const)(
    "rejects a %s user",
    async (level) => {
      const collection = await createCollection();
      const problem = await createProblem(collection);
      const user = await createUser();
      await createPermission(user, collection, level);
      await createAuthor(collection, { userId: user.id });
      signInAs(user);

      expect(await addSolution(problem.id, "text")).toEqual(
        error("You do not have permission to edit this collection"),
      );
      expect(await prisma.solution.count()).toBe(0);
    },
  );

  it("lets a TeamMember add a solution attributed to their author", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const user = await createUser();
    await createPermission(user, collection, "TeamMember");
    const author = await createAuthor(collection, { userId: user.id });
    signInAs(user);

    expect(await addSolution(problem.id, "Proof by intimidation")).toEqual({
      ok: true,
    });

    const solutions = await prisma.solution.findMany({
      include: { authors: true },
    });
    expect(solutions).toHaveLength(1);
    expect(solutions[0]).toMatchObject({
      problemId: problem.id,
      text: "Proof by intimidation",
    });
    expect(solutions[0].authors.map((a) => a.id)).toEqual([author.id]);
    expect(revalidatePath).toHaveBeenCalledWith(
      `/c/${collection.cid}/p/${problem.pid}`,
    );
  });

  it("refuses a second solution, which the page could not show", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    await createSolution(problem, { text: "First" });
    const user = await createUser();
    await createPermission(user, collection, "TeamMember");
    signInAs(user);

    expect(await addSolution(problem.id, "Second")).toEqual(
      error("This problem already has a solution. Reload the page to see it."),
    );
    expect(await prisma.solution.count()).toBe(1);
    expect(await prisma.author.count()).toBe(0);
  });

  it("adds exactly one of two solutions sent at the same time", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const first = await createUser();
    const second = await createUser();
    await createPermission(first, collection, "TeamMember");
    await createPermission(second, collection, "TeamMember");

    signInAs(first);
    const firstAdd = addSolution(problem.id, "One");
    signInAs(second);
    const secondAdd = addSolution(problem.id, "Two");
    const results = await Promise.all([firstAdd, secondAdd]);

    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(await prisma.solution.count()).toBe(1);
  });

  it("creates the member's author, named after them, with their first solution", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const user = await createUser({ name: "Ada Lovelace" });
    await createPermission(user, collection, "TeamMember");
    signInAs(user);

    expect(await addSolution(problem.id, "Proof")).toEqual({ ok: true });

    const authors = await prisma.author.findMany({
      where: { userId: user.id },
      include: { solutions: true },
    });
    expect(authors).toHaveLength(1);
    expect(authors[0].displayName).toBe("Ada Lovelace");
    expect(authors[0].solutions).toHaveLength(1);
  });
});

describe("editSolution", () => {
  it("rejects a signed-out user", async () => {
    signOut();

    expect(await editSolution(1, "text")).toEqual(error("Not signed in"));
  });

  it("rejects an unknown solution", async () => {
    signInAs(await createUser());

    expect((await editSolution(999, "text")).ok).toBe(false);
  });

  it("lets an Admin edit any solution", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const solution = await createSolution(problem, { text: "Before" });
    const admin = await createUser();
    await createPermission(admin, collection, "Admin");
    signInAs(admin);

    expect(await editSolution(solution.id, "After")).toEqual({ ok: true });
    expect(
      (
        await prisma.solution.findUniqueOrThrow({
          where: { id: solution.id },
        })
      ).text,
    ).toBe("After");
    expect(revalidatePath).toHaveBeenCalledWith(
      `/c/${collection.cid}/p/${problem.pid}`,
    );
  });

  it("lets a TeamMember edit only solutions they authored", async () => {
    const collection = await createCollection();
    const problem = await createProblem(collection);
    const member = await createUser();
    await createPermission(member, collection, "TeamMember");
    const memberAuthor = await createAuthor(collection, { userId: member.id });
    const otherAuthor = await createAuthor(collection);
    const own = await createSolution(problem, {
      authorIds: [memberAuthor.id],
    });
    const theirs = await createSolution(problem, {
      authorIds: [otherAuthor.id],
    });
    signInAs(member);

    expect(await editSolution(own.id, "edited")).toEqual({ ok: true });
    expect(await editSolution(theirs.id, "edited")).toEqual(
      error("You do not have permission to edit this collection"),
    );
  });
});
