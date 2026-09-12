"use server";

import { canAddProblem } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { ActionResponse, error, unexpectedError } from "@/lib/server-actions";
import { formDataToObject, idSchema, parseInput } from "@/lib/validation";
import { Subject } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { getAuthorIds, getPermission } from "@/lib/collection-access";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { z } from "zod";

const subjectPrefix = {
  Algebra: "A",
  Combinatorics: "C",
  Geometry: "G",
  NumberTheory: "N",
};

const problemFormSchema = z.object({
  title: z.string().min(1),
  subject: z.enum(Subject),
  statement: z.string().min(1),
  // Collections may make the answer optional; an empty answer is stored as "".
  answer: z.string().default(""),
  solution: z.string().default(""),
  authorId: z.coerce.number().int().positive(),
  // Collections may make difficulty optional; an empty choice is stored as null.
  difficulty: z.preprocess(
    (value) => (value === "" || value === undefined ? null : Number(value)),
    z.number().int().min(1).max(5).nullable(),
  ),
});

export async function addProblem(
  collectionId: number,
  formData: FormData,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (user === null) {
    return error("Not signed in");
  }
  const { userId } = user;

  const collectionIdInput = parseInput(idSchema, collectionId);
  if (!collectionIdInput.ok) {
    return collectionIdInput;
  }
  const input = parseInput(problemFormSchema, formDataToObject(formData));
  if (!input.ok) {
    return input;
  }
  const { title, subject, statement, answer, solution, authorId, difficulty } =
    input.data;

  try {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (collection === null) {
      return error("Collection not found");
    }

    const permission = await getPermission(userId, collectionId);
    if (!canAddProblem(permission)) {
      return error("You do not have permission to add a problem");
    }

    // The form submits the user's own Author; do not let a crafted request
    // attribute a problem to someone else.
    const authors = await getAuthorIds(userId, collectionId);
    if (!authors.some((author) => author.id === authorId)) {
      return error("Invalid input (authorId): not one of your authors");
    }

    const prefix = subjectPrefix[subject];

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
                id: userId,
              },
            },
          },
        },
      },
    });

    revalidatePath(`/c/${collection.cid}`);
    redirect(`/c/${collection.cid}/p/${newProblem.pid}`);
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    } else {
      return unexpectedError("addProblem", err);
    }
  }
}
