import { afterAll, beforeEach, vi } from "vitest";
import prisma from "@/lib/prisma";

// Runs in the worker before each integration test file.

// `auth()` would boot NextAuth with the Google provider and the Prisma adapter.
// Replace it with a mock the tests control through `signInAs()` (see ./session.ts).
vi.mock("auth", () => ({ auth: vi.fn() }));

// Server actions call revalidateTag(), which needs a Next.js request context.
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

async function resetDatabase() {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  if (tables.length === 0) {
    return;
  }
  const list = tables.map((t) => `"${t.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
  );
}

beforeEach(async () => {
  await resetDatabase();
  vi.clearAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});
