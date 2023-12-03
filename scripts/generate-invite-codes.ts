import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function generateRandomCode(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function getCollectionId(cid: string): Promise<number | null> {
  const collection = await prisma.collection.findUnique({
    where: { cid },
  });
  return collection ? collection.id : null;
}

async function createInvites() {
  const inviterId = await prompt("Enter the User ID for the inviter: ");
  const cid = await prompt("Enter the Collection CID: ");
  const collectionId = await getCollectionId(cid);

  if (!collectionId) {
    console.error("Collection not found.");
    process.exit(1);
  }

  const numberOfInvites = 1000;
  const accessLevel = "TeamMember";
  const oneTimeUse = true;
  const inviteCodes: string[] = [];

  for (let i = 0; i < numberOfInvites; i++) {
    const code = generateRandomCode(22);
    inviteCodes.push(code);
    await prisma.invite.create({
      data: {
        collectionId,
        accessLevel,
        inviterId,
        oneTimeUse,
        code,
      },
    });
  }

  console.log(`${numberOfInvites} invites created successfully.`);

  // Print all the invite codes
  inviteCodes.forEach((code) => console.log(code));

  rl.close();
}

createInvites()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
