import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  const { cid } = await params;

  // Extract and validate Bearer token
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Response.json(
      { error: "Missing or invalid Authorization header. Use: Bearer <token>" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  if (!token) {
    return Response.json({ error: "Empty token" }, { status: 401 });
  }

  // Look up token and verify collection ownership
  const apiToken = await prisma.apiToken.findUnique({
    where: { token },
    include: {
      collection: {
        select: {
          id: true,
          cid: true,
          name: true,
        },
      },
    },
  });

  if (!apiToken) {
    return Response.json({ error: "Invalid API token" }, { status: 401 });
  }

  if (apiToken.collection.cid !== cid) {
    return Response.json(
      { error: "Token not authorized for this collection" },
      { status: 403 }
    );
  }

  // Fetch problems with expanded relations
  const problems = await prisma.problem.findMany({
    where: {
      collectionId: apiToken.collection.id,
      isArchived: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      pid: true,
      title: true,
      statement: true,
      answer: true,
      subject: true,
      difficulty: true,
      source: true,
      isArchived: true,
      createdAt: true,
      authors: {
        select: {
          id: true,
          displayName: true,
          country: true,
        },
      },
      solutions: {
        select: {
          id: true,
          text: true,
          summary: true,
          authors: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  return Response.json({
    collection: {
      cid: apiToken.collection.cid,
      name: apiToken.collection.name,
    },
    problems,
  });
}
