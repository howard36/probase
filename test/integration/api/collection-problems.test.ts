import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/collections/[cid]/problems/route";
import {
  createApiToken,
  createAuthor,
  createCollection,
  createProblem,
  createSolution,
  createUser,
} from "../factories";

async function get(cid: string, headers: Record<string, string> = {}) {
  const request = new NextRequest(
    `http://localhost/api/collections/${cid}/problems`,
    { headers },
  );
  const response = await GET(request, { params: Promise.resolve({ cid }) });
  return { status: response.status, body: (await response.json()) as unknown };
}

describe("GET /api/collections/[cid]/problems", () => {
  it("401s without an Authorization header", async () => {
    const { status, body } = await get("anything");

    expect(status).toBe(401);
    expect(body).toEqual({
      error: "Missing or invalid Authorization header. Use: Bearer <token>",
    });
  });

  it("401s for a non-Bearer scheme", async () => {
    const { status } = await get("anything", { Authorization: "Basic abc" });

    expect(status).toBe(401);
  });

  it("401s for a Bearer header with no token", async () => {
    // Header values are whitespace-trimmed, so "Bearer " arrives as "Bearer".
    const { status } = await get("anything", { Authorization: "Bearer " });

    expect(status).toBe(401);
  });

  it("401s for an unknown token", async () => {
    const { status, body } = await get("anything", {
      Authorization: "Bearer not-a-real-token",
    });

    expect(status).toBe(401);
    expect(body).toEqual({ error: "Invalid API token" });
  });

  it("403s when the token belongs to a different collection", async () => {
    const owner = await createUser();
    const mine = await createCollection();
    const theirs = await createCollection();
    const token = await createApiToken(mine, owner);

    const { status, body } = await get(theirs.cid, {
      Authorization: `Bearer ${token.token}`,
    });

    expect(status).toBe(403);
    expect(body).toEqual({ error: "Token not authorized for this collection" });
  });

  it("returns an empty list for a collection with no problems", async () => {
    const owner = await createUser();
    const collection = await createCollection({ name: "Empty" });
    const token = await createApiToken(collection, owner);

    const { status, body } = await get(collection.cid, {
      Authorization: `Bearer ${token.token}`,
    });

    expect(status).toBe(200);
    expect(body).toEqual({
      collection: { cid: collection.cid, name: "Empty" },
      problems: [],
    });
  });

  it("returns non-archived problems, newest first, with authors and solutions", async () => {
    const owner = await createUser();
    const collection = await createCollection();
    const token = await createApiToken(collection, owner);
    const author = await createAuthor(collection, {
      displayName: "Euler",
      country: "CH",
    });

    const older = await createProblem(collection, {
      pid: "A1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      authorIds: [author.id],
      source: "Basel",
    });
    await createSolution(older, {
      text: "Sum the series.",
      summary: "Series",
      authorIds: [author.id],
    });
    const newer = await createProblem(collection, {
      pid: "A2",
      createdAt: new Date("2024-06-01T00:00:00Z"),
    });
    await createProblem(collection, {
      pid: "A3",
      createdAt: new Date("2024-12-01T00:00:00Z"),
      isArchived: true,
    });
    // A problem in another collection must not leak through.
    await createProblem(await createCollection(), { pid: "A1" });

    const { status, body } = await get(collection.cid, {
      Authorization: `Bearer ${token.token}`,
    });

    expect(status).toBe(200);
    expect(body).toEqual({
      collection: { cid: collection.cid, name: collection.name },
      problems: [
        {
          id: newer.id,
          pid: "A2",
          title: newer.title,
          statement: newer.statement,
          answer: "42",
          subject: "Algebra",
          difficulty: 1,
          source: null,
          isArchived: false,
          createdAt: "2024-06-01T00:00:00.000Z",
          authors: [],
          solutions: [],
        },
        {
          id: older.id,
          pid: "A1",
          title: older.title,
          statement: older.statement,
          answer: "42",
          subject: "Algebra",
          difficulty: 1,
          source: "Basel",
          isArchived: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          authors: [{ id: author.id, displayName: "Euler", country: "CH" }],
          solutions: [
            {
              id: expect.any(Number) as number,
              text: "Sum the series.",
              summary: "Series",
              authors: [{ id: author.id, displayName: "Euler" }],
            },
          ],
        },
      ],
    });
  });
});
