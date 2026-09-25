# Verification

The feature documents were written from the code and the tests. This directory is the protocol for checking them against the running app, one observable claim at a time.

## What is here

| File                                                 | Covers                        |
| ---------------------------------------------------- | ----------------------------- |
| [foundations-and-entry.md](foundations-and-entry.md) | `foundations/*` and `entry/*` |
| [collection.md](collection.md)                       | `collection/*`                |
| [problem-page.md](problem-page.md)                   | `problem-page/*`              |
| [testsolving.md](testsolving.md)                     | `testsolving/*`               |
| [cross-cutting.md](cross-cutting.md)                 | `cross-cutting/*`             |

Each file has one table per document. Each row is an item with a stable ID (`DISC-07`, `ATTEMPT-12`), a priority, what it needs (a role, a build, a network condition, a second browser), the claim with a link to the document section, the setup, numbered steps, the expected result, and a Result column. Items that cannot be checked by hand (design questions, things that need a product decision) are listed under each document as "Not checkable by hand".

Priorities: **P1** is an established fact, a claim many documents depend on, or a suspected bug; **P2** is an ordinary claim; **P3** is a number, a color, or a timing.

## How to run a pass

1. **Bring up a local instance.** Probase needs Postgres and a Google sign-in; a local pass replaces the sign-in with session cookies minted from the instance's own secret.
   1. Start a Postgres 16 server and create an empty database (for example `probase_dev`). Never point a verification run at the production database.
   2. Write an env file outside the repository with `DATABASE_URL` for that database, a random `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, and placeholder `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (real Google sign-in is not exercised).
   3. From the repository root: `npx dotenv -e {env file} -- prisma migrate deploy`.
   4. Load the fixtures described under [Fixtures](#fixtures). They replace everything in the database, including the demo seed.
   5. Build and start a **production** build: `npx dotenv -e {env file} -- next build`, then `npx dotenv -e {env file} -- next start -p 3000`. Several claims (prefetching, and the author it creates) hold only for production builds; the development server (`next dev`) behaves differently.
   6. To act as a user, set the cookie `authjs.session-token` on `localhost` to a token encoded with `encode()` from `@auth/core/jwt`, using the instance's `AUTH_SECRET`, the salt `authjs.session-token`, and a token whose `sub` is the user's id and which carries `name`, `currentEmail`, `givenName` and `familyName`. The Playwright harness under [Driving the app from a script](#driving-the-app-from-a-script) does this.
2. **Confirm the commit.** Every document says `Verified against Probase commit {sha}`. Run `git log -1 --format=%h -- . ':(exclude)product-description'` at the repository root; if it differs, the documents describe a different build and some failures will be drift, not defects.
3. **Keep the documents open beside the app.** Read the linked section before each item; the item is a summary, the section is the claim.
4. **Work through P1 first** across all files, then P2, then P3. Reload the fixtures between items that change shared state (attempts, invites, likes), or use a different user.
5. **Record** `pass`, `fail`, or `blocked` in the Result column, with a note for anything other than a clean pass. A fail is something the document says that the app does not do; a blocked item could not be run.
6. **File every fail** in [`bug-triage.md`](../bug-triage.md): if the entry exists, add a Status line quoting the item ID; if not, add an entry with the item ID under "Raised by". A fail is not automatically a product bug; sometimes the document is wrong, and the fix is to the document. Say which.
7. **Mark documents verified.** When every P1 and P2 item for a document has passed or been filed, change its row in the [coverage table](../README.md#coverage) from `drafted` to `verified`. A scripted pass alone never does this; see [Results so far](#results-so-far).

## Fixtures

A verification pass needs users in every role and collections in every configuration. The fixture set used for the first pass creates:

| Collection                 | Settings                                                     | Problems                                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `demo` "Probase Demo"      | Authors hidden, ShortAnswer, no testsolving                  | `A1` (math answer, one solution), `N1`, `C1` (by Wes, no solution), `G1` (empty answer), `A2` (archived), `A3` (math in the title, broken math), `A4`–`A24` fillers (so there are two pages) |
| `ts` "Testsolve Lab"       | Authors shown, Integer, requires testsolving                 | `A1`, `N1` (difficulty 2), `C1` (answer `$\sqrt{2}$`), `G1` (no difficulty), `A2` (solved by Sue), `N2` (six solvers and one non-solver); test "Mock Contest #1" with `A1`, `N1`, `A2`       |
| `aime` "AIME Lab"          | AIME, requires testsolving, difficulty and solution optional | `A1`                                                                                                                                                                                         |
| `topsoj`, `otis-mock-aime` | Named in the code-level configuration                        | None                                                                                                                                                                                         |

| User          | Role and type                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Ada Admin     | Admin in `demo`, `ts` (Serious), `aime` (Serious), `otis-mock-aime`                               |
| Wes Writer    | TeamMember in `demo` and `ts` (Serious); author of `demo` `C1`, `G1`, `A2` and every `ts` problem |
| Tia Member    | TeamMember in `demo`, with no author until the add-problem page loads for her                     |
| Sam Serious   | TeamMember, Serious, in `ts` and `aime`; no attempts                                              |
| Sue Serious   | ViewOnly, Serious, in `ts`; solved `ts` `A2` on her second answer                                 |
| Cal Casual    | ViewOnly, Casual, in `ts`                                                                         |
| Uma Unchosen  | TeamMember in `ts` with no testsolver type                                                        |
| Vic Viewer    | ViewOnly in `demo`                                                                                |
| Sid Submitter | SubmitOnly in `demo` (email at `example.edu`)                                                     |
| Stan Stranger | No permission anywhere                                                                            |
| Eve Student   | No permission anywhere (email at `example.edu`)                                                   |

Invites, all created by Ada: `demo` (Admin), `join-demo`, `view-demo`, `submit-demo` (by role), `once-demo` (one-time), `once-expiring` (one-time with an expiry a week out), `expired-demo` (expired yesterday), `edu-demo` (limited to `example.edu`), `join-ts`, `join-topsoj`.

The fixture script is not part of the repository; it is a straightforward Prisma script that truncates every table and creates the rows above.

## Devices and conditions

- **Role** (`admin`, `writer`, `member`, `serious`, `serious2`, `casual`, `unchosen`, `viewer`, `submitter`, `stranger`, `student`, `signed out`): which fixture user the browser is signed in as. A second role in the same item means a second browser context, not a second tab.
- **Second tab**: the same user in a second tab of the same browser context.
- **Prod build**: the item holds only on a production build (`next build` + `next start`), usually because of prefetching.
- **Slow server**: server actions delayed by two to three seconds (in Playwright, a route handler that waits before continuing requests carrying a `next-action` header). Devtools' network throttling works too but delays everything.
- **Offline**: the browser set offline after the page has loaded.
- **Narrow**: a window 375 px wide.
- **Keyboard**: keyboard only, no pointer.
- **Screen reader**: VoiceOver, NVDA or an accessibility-tree inspection.
- **Hand**: needs a person to watch something a script cannot judge (a browser's validation bubble, a visual cue, a focus ring, timing that feels off).

## Driving the app from a script

A Playwright script can do most P1 and P2 items: sign in by cookie, click, type, wait, and read back the page, the URL, the toasts (`role="alert"`), the server actions sent (POST requests with a `next-action` header), and the database. It should use real input for items about input and use the database only to set up and observe.

What a script cannot do well: judge anything visual (colors, spacing, focus rings, the spinner's look), see the browser's own validation bubbles (it can only read `:invalid` and whether a request was sent), exercise real Google sign-in, or stand in for a screen reader. Headless Chromium is one browser; items that depend on blur and focus behavior can differ in Safari and Firefox.

## Results so far

A first scripted pass will be recorded here with its date, the build, the means, the counts, and what it did not cover.
