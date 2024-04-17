"use server";

import { canAddProblem } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { ActionResponse, error } from "@/lib/server-actions";
import { Subject } from "@prisma/client";
import { auth } from "auth";
import { revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";

const subjectPrefix = {
  Algebra: "A",
  Combinatorics: "C",
  Geometry: "G",
  NumberTheory: "N",
};

export async function addProblem(collectionId: number, formData: FormData): Promise<ActionResponse> {
  const session = await auth();
  if (session === null) {
    return error("Not signed in");
  }

  const userId = session.userId;
  if (userId === undefined) {
    return error("userId is undefined despite being logged in");
  }

  const title = formData.get("title") as string;
  const subject = formData.get("subject") as Subject;
  const statement = formData.get("statement") as string;
  const answer = formData.get("answer") as string;
  const solution = formData.get("solution") as string;
  const authorId = parseInt(formData.get("authorId") as string);
  const difficulty = parseInt(formData.get("difficulty") as string);
  // TODO: validate input

  try {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (collection === null) {
      return error("Collection not found");
    }

    const permission = await prisma.permission.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId,
        },
      },
    });
    if (!canAddProblem(permission)) {
      return error("You do not have permission to add a problem");
    }

    const prefix = subjectPrefix[subject as Subject];

    // The most recent problem in this subject
    const lastProblem = await prisma.problem.findFirst({
      where: {
        collectionId,
        pid: {
          startsWith: prefix,
        },
      },
      orderBy: {
        id: "desc",
      },
      select: {
        pid: true,
      },
    });

    let pid;
    if (lastProblem === null) {
      // first problem in this subject
      pid = prefix + "1";
    } else {
      const oldPid = lastProblem.pid;
      const num = oldPid.substring(prefix.length);
      const incrementedNum = parseInt(num, 10) + 1;
      pid = prefix + incrementedNum;
    }

    const newProblem = await prisma.problem.create({
      data: {
        collection: {
          connect: { id: collectionId },
        },
        pid,
        title,
        subject,
        statement,
        answer,
        difficulty,
        isAnonymous: false,
        submitter: {
          connect: { id: userId },
        },
        authors: {
          connect: { id: authorId },
        },
        solutions:
          solution === ""
            ? undefined
            : {
              create: [
                {
                  text: solution,
                  authors: {
                    connect: { id: authorId }, // TODO: solution might have different list of authors
                  },
                },
              ],
            },
        likes: {
          create: {
            user: {
              connect: {
                id: session.userId,
              },
            },
          },
        },
      },
    });

    revalidateTag(`collection/${collection.cid}/problems`);
    redirect(`/c/${collection.cid}/p/${newProblem.pid}`);
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    } else {
      return error(String(err));
    }
  }
}
