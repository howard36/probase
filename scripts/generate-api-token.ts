import { PrismaClient } from "@prisma/client";
import readline from "readline";
import crypto from "crypto";

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

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function main() {
  const userId = await prompt("Enter your User ID: ");
  const cid = await prompt("Enter the Collection CID: ");
  const name = await prompt("Enter a name for this token (e.g., 'LaTeX export'): ");

  const collection = await prisma.collection.findUnique({
    where: { cid },
  });

  if (!collection) {
    console.error(`Collection '${cid}' not found`);
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error(`User '${userId}' not found`);
    process.exit(1);
  }

  const token = generateToken();

  await prisma.apiToken.create({
    data: {
      token,
      name,
      collectionId: collection.id,
      createdByUserId: userId,
    },
  });

  console.log("\nAPI Token created successfully!");
  console.log(`Token: ${token}`);
  console.log(`Collection: ${cid}`);
  console.log(`Name: ${name}`);
  console.log(`\nUsage: curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/collections/${cid}/problems`);

  rl.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch((disconnectError) => {
      console.error(disconnectError);
    });
  });
