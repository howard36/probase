import { PrismaClient } from '@prisma/client'
import { PrismaAdapter } from "@next-auth/prisma-adapter"

const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

async function main() {
  const cmimc = await prisma.collection.upsert({
    where: { cid: 'cmimc' },
    update: {},
    create: {
      name: 'CMIMC',
      cid: 'cmimc',
      showAuthors: false,
    }
  });

  await adapter.createUser({
    name: 'Howard Halim',
    email: 'howardhalim@gmail.com',
    emailVerified: null,
  });

  const howardUser = await prisma.user.findUniqueOrThrow({
    where: { email: 'howardhalim@gmail.com' },
  });

  await prisma.permission.upsert({
    where: {
      userId_collectionId: {
        userId: howardUser.id,
        collectionId: cmimc.id,
      }
    },
    update: {},
    create: {
      userId: howardUser.id,
      collectionId: cmimc.id,
      accessLevel: 'Admin',
    }
  });

  const howardAuthor = await prisma.author.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      displayName: 'Howard Halim',
      collectionId: cmimc.id,
      userId: howardUser.id,
    }
  });

  await prisma.problem.upsert({
    where: {
      collectionId_pid: {
        collectionId: cmimc.id,
        pid: 'A1',
      }
    },
    update: {},
    create: {
      collectionId: cmimc.id,
      pid: 'A1',
      title: 'Quadratic Equation',
      statement: 'Compute the roots of the quadratic $$x^2 - 4x + 2$$',
      submitterId: howardUser.id,
      authors: {
        connect: [{ id: howardAuthor.id }]
      },
      answer: String.raw`$2 \pm \sqrt{2}$`,
      solutions: {
        create: [{
          text: String.raw`Use the quadratic formula to get
$$x = \frac{4 \pm \sqrt{4^2 - 4 \cdot 1 \cdot 2}}{2} = 2 \pm \sqrt{2}$$`,
          authors: {
            connect: [{ id: howardAuthor.id }]
          },
        }]
      },
      subject: 'Algebra',
      difficulty: 0,
      isAnonymous: false,
    },
  });

  await prisma.problem.upsert({
    where: {
      collectionId_pid: {
        collectionId: cmimc.id,
        pid: 'N1',
      }
    },
    update: {},
    create: {
      collectionId: cmimc.id,
      pid: 'N1',
      title: 'Diophantine',
      statement: 'Find all positive integer solutions to $$a^n + b^n = c^n.$$',
      submitterId: howardUser.id,
      authors: {
        connect: [{ id: howardAuthor.id }]
      },
      answer: String.raw`No positive integer solutions for $n \ge 3$.`,
      solutions: {
        create: [{
          text: 'Try using LTE.',
          authors: {
            connect: [{ id: howardAuthor.id }]
          },
        }]
      },
      subject: 'NumberTheory',
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
  })
