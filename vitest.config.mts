// `.mts` so Vite loads this as ESM: package.json has no `"type": "module"`,
// and Vitest's CommonJS entry cannot require its ESM dependencies on Node 22.
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

// Mirror tsconfig.json: `@/x` -> `./x`, and the bare `auth` import -> `./auth.ts`.
const alias = [
  { find: /^@\/(.*)$/, replacement: path.join(root, "$1") },
  { find: /^auth$/, replacement: path.join(root, "auth.ts") },
];

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    projects: [
      {
        // Pure functions in lib/. No DOM, no database.
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["test/unit/**/*.test.ts"],
        },
      },
      {
        // React components rendered with Testing Library in happy-dom.
        // (jsdom 27 needs require(esm), which Node 22.8 in .nvmrc lacks.)
        extends: true,
        test: {
          name: "components",
          environment: "happy-dom",
          include: ["test/unit/**/*.test.tsx"],
          setupFiles: ["test/setup-dom.ts"],
        },
      },
      {
        // Server actions and route handlers against a real Postgres database.
        // Requires DATABASE_URL (see .env.test) and `npm run test:db`.
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["test/integration/**/*.test.ts"],
          globalSetup: ["test/integration/global-setup.ts"],
          setupFiles: ["test/integration/setup.ts"],
          // Every file shares one database, so files must not run concurrently.
          fileParallelism: false,
          testTimeout: 15_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
