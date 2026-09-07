import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

// Runs once, in the main process, before any integration test file.
// Applies the Prisma migrations so the test database matches prisma/schema.prisma.
export default function setup() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Run integration tests with `npm run test:integration` " +
        "(it loads .env.test) and start the database with `npm run test:db`.",
    );
  }

  // The tests TRUNCATE every table before each test. Never let that hit a real database.
  const dbName = new URL(url).pathname.replace(/^\//, "");
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `Refusing to run integration tests against database "${dbName}": ` +
        "the name must end with `_test` (see .env.test).",
    );
  }

  const require = createRequire(import.meta.url);
  const prismaCli = require.resolve("prisma/build/index.js");
  try {
    execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], {
      stdio: "pipe",
      env: process.env,
    });
  } catch (err) {
    const stderr =
      err instanceof Error && "stderr" in err
        ? String((err as { stderr: unknown }).stderr)
        : String(err);
    throw new Error(
      "`prisma migrate deploy` failed against the test database. " +
        "Is it running? Start it with `npm run test:db`.\n\n" +
        stderr,
    );
  }
}
