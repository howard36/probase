# Goal: complete the Probase product description

You are working in the `product-description/` folder of the Probase repository. Read `README.md`, `glossary.md`, `foundations/saving-and-feedback.md`, and `problem-page/discussion.md` first. The README defines the purpose, the document template, the method, the structure, and the coverage table. The other three are the exemplars: match their depth, tone, and structure exactly. Your job is to write every document in the README's structure until the coverage table has no `not started` rows, then run a consistency pass.

## Source of truth

The Probase source is the repository this folder lives in, one level up (`..` from here; `/home/user/probase` in the session that started this work). Describe the experience of the Probase web site as a signed-out visitor and as a member of a collection in every role and testsolver type, with collection settings at their database defaults unless a document says otherwise and the code-level configuration in `lib/collection-config.ts` as it stands. The bearer-token API (`app/api/collections/`), the operator scripts (`scripts/`), and Google's own sign-in screens are out of scope.

For each document, read in this order before writing:

1. The page and its components: `app/**/page.tsx` for the route, the components it renders (server components beside it, `"use client"` components beside it and in `components/`), and the server actions it calls (`actions.ts` beside the page; the problem page's are all in `app/c/[cid]/p/[pid]/actions.ts`).
2. The shared rules: `lib/permissions.ts` (who may do what), `lib/collection-access.ts` (the redirects every collection page runs through, in order), `lib/current-user.ts` (signed in or not), `app/c/[cid]/p/[pid]/view.ts` (locked / testsolving / unlocked), `lib/testsolve.ts` (time limit, grace buffer, submission limit), `lib/filter.ts` (the collection page's URL state), `lib/collection-config.ts` (slug-specific settings), `lib/server-actions.ts` and `lib/toast.ts` (how results reach the user).
3. The tests in `test/`. They are close to executable specifications of edge cases. Key files: `test/integration/actions/*.test.ts` (every action's auth, permission, validation and happy path), `test/integration/pages/*.test.ts` (what each page sends to the browser), `test/integration/lib/collection-access.test.ts` (redirect order), `test/unit/app/problem-view.test.ts`, `test/unit/lib/problem-lock.test.ts`, `test/unit/lib/permissions.test.ts`, `test/unit/lib/apply-filter.test.ts`, `test/unit/lib/filter.test.ts`, `test/unit/components/*.test.tsx` (click-to-edit, the answer boxes, the toaster).
4. UI behavior: `components/` (click-to-edit, answer inputs, submit button, toaster, likes, sidebar, problem-list sidebar, search, filter, pagination) and `components/ui/` (the shadcn checkbox, switch, pagination primitives).
5. Defaults and thresholds: `prisma/schema.prisma` (field defaults), `lib/testsolve.ts`, `lib/filter.ts` (`PAGE_SIZE`), `components/toaster.tsx` (`DISMISS_AFTER_MILLIS`), `auth.ts` (session strategy).

Do not describe code. Describe what the user sees and does. Technical detail goes only in `> Technical note:` block quotes, and only when the mechanism changes what the user would expect.

## Writing rules

- Follow the eight-section template in the README for every feature document. Foundations and cross-cutting documents may drop sections that do not apply but must still cover cancel/interrupt behavior wherever an interaction exists.
- Section 3's five subsections are headed exactly `### Arrive`, `### Leave untouched`, `### Begin editing`, `### While editing`, `### Submit`.
- Modifiers and cancel/interrupt go in tables, as in `problem-page/discussion.md`. The Modifiers rows are **Role**, **Authorship**, **Testsolver type**, **Record state**, **Collection settings**, **Keys**, with columns **At arrival** and **During editing**. The interrupt rows are the fourteen in the README, in the README's order and wording, with columns **Before editing** and **While editing**. The cross-cutting paragraphs are the thirteen in the README, in order. Do not add, drop, or reorder rows or paragraphs in a single document; every cell filled, "No effect." where that is the answer.
- Use the glossary's words. If you need a term the glossary lacks, add it to `glossary.md` in the right section with a one-paragraph definition, then use it. Use Probase's own UI wording in quotes where it has one ("Post comment", "Show spoilers", "Testsolve to view").
- Sentence case for all headings. Direct, concrete language. No hedging, no marketing.
- State surprising behavior plainly and say why if the reason is in the code or a comment. If it looks like a bug, say so in "Open questions" rather than smoothing it over.
- Cross-reference other documents with relative links rather than repeating their content. The foundations own the facts listed under "Things already established" below. Do not restate them at length; link.
- Every document ends with "## Open questions and verification" listing what was read from code but not confirmed by hand, followed by a line `Verified against Probase commit \`{sha}\``where`{sha}`is the output of`git log -1 --format=%h -- . ':(exclude)product-description'` run at the repository root (the latest commit outside this folder).
- Mermaid `stateDiagram-v2` for each interaction's states. Keep it to the states the user passes through; omit internal bookkeeping states.
- Files are formatted by Prettier (the repository's CI checks every file). Tables get column-aligned; that is expected. Run `npx prettier --write product-description` from the repository root before committing if your editor did not.

## Things already established (do not re-derive, do not contradict)

_Filled in as the foundations are written._

## Order of work

1. The pilot, `problem-page/discussion.md`, then `foundations/`, in this order: `saving-and-feedback.md`, `click-to-edit.md`, `accounts-and-roles.md`, `data-model.md`, `navigation.md`. Everything else links to them.
2. The problem page and testsolving next: `problem-page/problem-page.md`, then `testsolving/locked-problem.md`, `testsolving/timed-attempt.md`, `testsolving/leaderboard.md`, `testsolving/choosing-a-testsolver-type.md`. Read `app/c/[cid]/p/[pid]/` in full, with `view.ts`, `lib/testsolve.ts` and `lib/permissions.ts`, before starting any of them, because the three views hand off to each other and the documents must agree on where one ends and the next begins.
3. The remaining `problem-page/` documents, then `collection/`, `entry/`, `cross-cutting/`. These are independent of each other and can be drafted in parallel with subagents once the foundations and the problem-page documents exist to link to. If you parallelize, give each subagent this prompt, the exemplars, and the specific document to write; then review every result yourself for consistency with the glossary and the established facts below before accepting it.
4. Consistency pass over the whole set: same term for the same thing everywhere, no two documents describing the same behavior differently, every relative link resolves (`python3 {product-description skill}/references/check-links.py product-description`), every document has a verification footer, every glossary term used is defined.
5. Update the coverage table in `README.md` as you go: `drafted` when written, never `verified` (verification by hand is a separate pass).

## Working rules

- Commit after each document or coherent group of documents with a message of the form `docs: add product-description/{path}` or `docs: revise product-description/{path}`. The repository uses Conventional Commits with a lowercase description; end the message with the attribution trailers the session provides.
- Do not modify anything outside `product-description/`. The rest of the repository is read-only reference material.
- Do not add files outside the README's structure without updating the structure and coverage table to match.
- When a behavior cannot be determined from code and tests, write down what you could determine, put the rest in "Open questions", and move on. Do not guess and do not block.
- Depth bar: `problem-page/discussion.md` is roughly 170 lines for a small feature. The problem page and the timed attempt will be longer; the error pages and the home page will be shorter. Completeness matters more than length. Every state, every variant row, every cancel/interrupt row must be accounted for, even if the answer is "no effect".
- If you find that the README's structure is wrong for something you discover (a document that should be split, two that should merge), make the change, update the structure and coverage table, and note why in the commit message.

You are done when the coverage table has no `not started` rows, the consistency pass is complete, and everything is committed.
