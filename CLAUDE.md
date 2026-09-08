# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Env files are never loaded implicitly. Prefix DB/Prisma commands with the env wrapper:
  `npm run local -- prisma migrate dev`, `npm run local -- prisma db seed`.
- Verification before calling a change done: `npm run lint`, `npx prettier . --check`, `npx tsc --noEmit`, `npm test`, `npm run test:integration` (needs `npm run test:db` first), `npm run build`. CI runs all of these on every pull request.
- Seed script is `prisma/seed.mjs` (plain JS, run by `prisma db seed`).

## Tests

- Vitest, configured in `vitest.config.mts` (must stay `.mts`: the package is CommonJS and Vitest's CJS entry can't load on Node 22.8). Three projects: `unit` (`test/unit/**/*.test.ts`), `components` (`test/unit/**/*.test.tsx`, happy-dom + Testing Library), `integration` (`test/integration/**/*.test.ts`).
- Integration tests hit a real Postgres (`docker-compose.test.yml`, port 5433, `.env.test`). They mock only `auth()` and `next/cache`; use `signInAs()` from `test/integration/session.ts` and the row builders in `test/integration/factories.ts`. Every table is truncated before each test, so the global setup refuses any database whose name doesn't end in `_test`. Never point `.env.test` at the dev or prod database.
- `redirect()` / `notFound()` throw; assert them with `expectRedirect()` / `expectNotFound()` from `test/integration/navigation.ts`.
- Pages are tested by calling the page function directly (`test/integration/pages/`). `clientPayload()` in `test/integration/pages/client-payload.ts` expands the server tree and returns everything that would be serialized to the browser, which is how the "locked problems never send their answer" invariant is tested. Keep its list of client components in each test current when adding a `"use client"` file under that page.
- When adding a server action, add an integration test for its auth and permission failures, its invalid-input rejection, and its happy path.

## Production safety

- Never run `npm run prod -- ...`, `npm run dev:prod`, or anything that reads `.env.prod` without asking first. `dev:prod` runs the local dev server against the production database with no confirmation prompt.
- Merging to `main` auto-runs `prisma migrate deploy` against production (`.github/workflows/prisma-migrate-deploy.yml`) and Vercel deploys the app. Treat every migration in a PR as a production change. The migration runs before the new code is live, so a column drop must land in a separate PR after the code that read it is gone.
- `.env.local` holds real secrets. Never print or commit it.

## Git flow

- Branch off `main` with a descriptive kebab-case name, no prefix (e.g. `one-time-use-invites`). Open a PR; PRs are rebased into `main`, not squashed. Branch protection requires the branch to be up to date with `main`, so rebase before merging.
- Commit subjects use Conventional Commits: `<type>: <short imperative description>` with a lowercase description, e.g. `feat: limit testsolving attempts to 5 submissions`. Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `ci`. Older history predates this convention; follow it for new commits and PR titles.

## Architecture invariants

These are enforced by the code and its tests. Follow them rather than reimplementing what they cover.

- **Who is signed in**: `getCurrentUser()` / `requireCurrentUser(callbackPath)` in `lib/current-user.ts`. Never call `auth()` directly outside that module.
- **Access to a collection**: pages under `/c/[cid]` start with `requireCollectionAccess(cid, callbackPath)` from `lib/collection-access.ts`, which handles the 404, sign-in redirect, need-permission redirect and testsolver-type chooser redirect in that order. Actions use `getPermission()` / `getAuthorIds()` from the same module and the `can*` predicates in `lib/permissions.ts`.
- **What a user may see of a problem**: `needsTestsolveToView()` / `isProblemLocked()` in `lib/permissions.ts`, called by the problem page, the problem card and the test card. `app/c/[cid]/p/[pid]/view.ts` turns that into the locked / testsolving / unlocked view.
- **Server decides, client renders**: the collection page and the problem page are server components. Client components (`"use client"`) receive only the props they render, and a locked problem's statement, answer, solutions, comments and other users' attempts never reach a client component. When you pass an object to a client component, pass a narrowed literal (`{ id, likes }`), not the whole Prisma row.
- **Server actions**: return `ActionResponse` (`{ ok: true }` / `{ ok: false, error }`) instead of throwing; build errors with `error()` from `lib/server-actions.ts`. Every action validates its arguments first with a zod schema through `parseInput()` from `lib/validation.ts`. Unexpected exceptions go through `unexpectedError()`, which logs the real error server-side and returns a generic message; deliberate messages are shown to the user as toasts, so write them for people. An action that changes what a page shows calls `revalidatePath()` on that page before returning; components do not call `router.refresh()` after such an action.
- **Calling actions from the client**: `wrapAction(action, onSuccess?, onError?)` for fire-and-forget with an optional undo of optimistic UI, `runAction(action)` when the caller needs the result. Both show the error toast. `ClickToEdit` takes an `onSave` that returns `Promise<boolean>` and reopens with the draft on `false`.
- **Concurrent writes**: limits that must not be exceeded (submission count, one-time invites, give-up) are re-checked in the `where` of the write, not only read beforehand.
- **Per-collection settings** that are not in the database yet (sidebar list, collections that force serious testsolving, custom difficulty labels) live in `lib/collection-config.ts`. Never compare against a collection slug anywhere else.
- **Testsolving numbers**: limits, buffer and the time-limit formula live in `lib/testsolve.ts`.

## Code conventions

- ESLint enforces `@typescript-eslint/no-floating-promises` as an error: every un-awaited promise needs `.catch(...)` or `void`.
- Component filenames are kebab-case. Use `cn()` from `lib/utils.ts` for class merging, not raw `clsx`.
- shadcn/ui components live in `components/ui/`; design tokens are HSL CSS variables in `styles/globals.css`. Prettier sorts Tailwind classes via `prettier-plugin-tailwindcss`.
- Import the root auth module as `"auth"`, not `@/auth`.

## Gotchas

- Problem IDs (`A1`, `N2`, ...) are generated by incrementing the highest existing ID with the same subject prefix in `app/c/[cid]/add-problem/actions.ts`. Two simultaneous submissions in the same subject can collide on the unique constraint; the second one gets the generic error.
- An empty answer is stored as `""`, not `null`, on purpose: the problem page only offers the answer editor when `answer` is not null, so `""` is how "no answer yet, add one later" is represented.
- `SubmitOnly` members can add problems but cannot view the collection, so they have no navigable route to the form; the add-problem page deliberately uses `getPermission()` rather than `requireCollectionAccess()` to keep that working.
- `Test` rows have no UI; they are created directly in the database. Test pages are reached from the chips on a problem page.
