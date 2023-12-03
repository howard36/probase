import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

async function main() {
  const demo = await prisma.collection.upsert({
    where: { cid: "demo" },
    update: {},
    create: {
      name: "Probase Demo",
      cid: "demo",
      showAuthors: false,
      shortAnswer: true,
    },
  });

  const createUser = adapter.createUser;
  if (createUser === undefined) {
    throw new Error("adapter.createUser is undefined");
  }
  await createUser({
    name: "Howard Halim",
    email: "howardhalim@gmail.com",
    emailVerified: null,
  });

  const howardUser = await prisma.user.findUniqueOrThrow({
    where: { email: "howardhalim@gmail.com" },
  });

  await prisma.invite.create({
    data: {
      collectionId: demo.id,
      accessLevel: "Admin",
      code: "demo",
      inviterId: howardUser.id,
    },
  });

  await prisma.permission.upsert({
    where: {
      userId_collectionId: {
        userId: howardUser.id,
        collectionId: demo.id,
      },
    },
    update: {},
    create: {
      userId: howardUser.id,
      collectionId: demo.id,
      accessLevel: "Admin",
    },
  });

  const defaultAuthor = await prisma.author.upsert({
    where: { id: 1 },
    update: {},
    create: {
      displayName: "Default Author",
      collectionId: demo.id,
    },
  });

  await prisma.problem.upsert({
    where: {
      collectionId_pid: {
        collectionId: demo.id,
        pid: "A1",
      },
    },
    update: {},
    create: {
      collectionId: demo.id,
      pid: "A1",
      title: "Quadratic Equation",
      statement: "Find all roots of the quadratic $$x^2 - 4x + 2.$$",
      submitterId: howardUser.id,
      authors: {
        connect: [{ id: defaultAuthor.id }],
      },
      answer: String.raw`$2 \pm \sqrt{2}$`,
      solutions: {
        create: [
          {
            text: String.raw`Use the quadratic formula to get
$$x = \frac{4 \pm \sqrt{4^2 - 4 \cdot 1 \cdot 2}}{2} = 2 \pm \sqrt{2}$$`,
            authors: {
              connect: [{ id: defaultAuthor.id }],
            },
          },
        ],
      },
      subject: "Algebra",
      difficulty: 0,
      isAnonymous: false,
    },
  });

  await prisma.problem.upsert({
    where: {
      collectionId_pid: {
        collectionId: demo.id,
        pid: "N1",
      },
    },
    update: {},
    create: {
      collectionId: demo.id,
      pid: "N1",
      title: "Fermat's Last Theorem",
      statement:
        "Find all positive integer solutions to $$a^n + b^n = c^n$$ which satisfy $n \\ge 3$.",
      submitterId: howardUser.id,
      authors: {
        connect: [{ id: defaultAuthor.id }],
      },
      answer: String.raw`No positive integer solutions for $n \ge 3$.`,
      solutions: {
        create: [
          {
            text: "The proof is trivial and is left as an exercise to the reader.",
            authors: {
              connect: [{ id: defaultAuthor.id }],
            },
          },
        ],
      },
      subject: "NumberTheory",
      difficulty: 0,
      isAnonymous: false,
    },
  });

  await prisma.problem.upsert({
    where: {
      collectionId_pid: {
        collectionId: demo.id,
        pid: "C1",
      },
    },
    update: {},
    create: {
      collectionId: demo.id,
      pid: "C1",
      title: "Combinatorics",
      statement:
        "The best combo problems involve reading walls of text, so...\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      submitterId: howardUser.id,
      authors: {
        connect: [{ id: defaultAuthor.id }],
      },
      answer: "Answer",
      solutions: {
        create: [
          {
            text: "Solution",
            authors: {
              connect: [{ id: defaultAuthor.id }],
            },
          },
        ],
      },
      subject: "Combinatorics",
      difficulty: 0,
      isAnonymous: false,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
