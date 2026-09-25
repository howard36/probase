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

Saving and feedback ([foundations/saving-and-feedback.md](foundations/saving-and-feedback.md)):

- Every change is an action that answers ok or an error. Errors are shown as toasts in the bottom-right corner, 8 seconds each, stacked, with a close button; there are no success toasts. Unexpected failures (server, network, database collisions) show "Something went wrong. Please try again."
- Form submit buttons ("Post comment", "Start testsolving", the timed attempt's "Submit" and "Give Up", the add-problem "Submit") disable themselves and show a spinner while their action is pending; a second click does nothing. Plain buttons ("Accept Invite", "Confirm", Add Solution's "Submit", "Give Up" with an empty answer box) have no pending state, and a second click sends a second request: say what that does in each feature document. (Confirmed for "Post comment" in the running app.)
- Optimistic controls: the heart, the Archive switch, and problem-page click-to-edit fields. They roll back on error. Everything else waits for the server.
- A successful action refreshes the page in place (scroll and typed text in components that stay are kept) and clears the browser's cache of other pages. A refresh does not update the heart, the Archive switch, or click-to-edit fields, which keep the value they were first given; lists and read-only text do update.
- Nothing is saved in the browser. No drafts, no "leave this page?" warning.

Click-to-edit ([foundations/click-to-edit.md](foundations/click-to-edit.md)):

- Three variants: single-line (Enter or blur saves), multi-line (Shift/Ctrl/Cmd+Enter or "Save changes"; "Discard"; blur does nothing), multi-line autosaving (add-problem form only; blur saves). Escape abandons. An empty box is never saved, so a field with text can never be emptied. A field whose text is empty starts open and focused. Every save sends a request even if unchanged. On error the old text is restored underneath and the editor reopens with the typed text.

Accounts and roles ([foundations/accounts-and-roles.md](foundations/accounts-and-roles.md)):

- Google is the only sign-in. The session lasts 30 days from sign-in and is not renewed by browsing. There is no sign-out control.
- Roles: Admin (everything, edits all), TeamMember (reads, adds, edits own), ViewOnly (reads, likes, comments, testsolves), SubmitOnly (adds problems only; cannot open the collection). "Can view" = Admin, TeamMember, ViewOnly. "Can edit" a problem = Admin, or TeamMember/SubmitOnly with authorship.
- A user gets an author in a collection the first time the add-problem page loads for them (on a production build, when the collection page's "Add Problem" link is prefetched). "Add Solution" is offered only to users with an author.
- Collection pages check, in order: collection exists (404), signed in (login), can view (need-permission), testsolver type chosen if the collection requires testsolving (chooser). The add-problem page and the test page have their own orders; see [navigation](foundations/navigation.md#what-each-page-checks-in-order).
- In a collection that requires testsolving every member who can view, Admins included, must choose Serious or Casual. `topsoj` and `mgci` make new members Serious on joining. The chooser can be reopened only by typing its address.

Data model ([foundations/data-model.md](foundations/data-model.md)):

- Problem IDs: subject letter (A, C, G, N) + one more than the most recently created problem with that letter. Two simultaneous submissions in one subject can collide; the second gets the generic error.
- The answer is absent, empty (`""`, "add one later"), or text. A timed attempt compares character for character.
- At most one attempt per user per problem; never retried, never deleted. At most one like per user per problem; submitting a problem likes it. Nothing can be deleted through the interface. Only the first solution is ever shown.

Navigation ([foundations/navigation.md](foundations/navigation.md)):

- The collection page's search, subjects, Archived, Unsolved only and page live in the query string. Search and filter changes replace the history entry without scrolling; page numbers add one. Problem cards carry the query string to the problem page, whose back link, Previous and Next carry it on.
- Previous and Next do arithmetic on the problem ID: same subject, archived included, Previous disabled at 1, Next always enabled (404 past the end).
- The sidebar appears only on the home page, "Page not found" and "You need permission". The collection page has no link to anywhere else.
- On a production build most links prefetch their destination as soon as they are visible and reuse it for up to five minutes unless an action or refresh clears the cache. Previous, Next and the pagination arrows do not. The development server never prefetches.

Established later, by the drafts and the first local pass:

- A page's actions go out one at a time through the framework's router queue; following a link does not cancel a pending action, and its error toast appears on the new page.
- Enter in a single-line click-to-edit box closes it and never submits a surrounding form; Enter in a plain box (integer, AIME, the timed attempt's answer, the search box) triggers the browser's implicit submission.
- Clicking a button below an open click-to-edit box can be lost, because closing the box moves the button (confirmed on the add-problem form's "Submit").
- Signing in again while signed in attaches the new Google account to the current user; it never switches users. Sign-out exists only at `/api/auth/signout`.
- The search box and the filter controls show the URL's values, not their own, so fast typing drops characters and quick clicks cancel each other; Enter in the search box reloads the bare collection page.
- A one-time invite that also has an expiry can never be accepted.

Testsolving numbers (`lib/testsolve.ts`):

- Time limit: 5 + 5 × difficulty minutes (10 to 30). Grace buffer: 10 seconds, for Submit only, not Give Up, not shown. Submission limit: 5.

Ownership of the problem page's states:

- [problem-page/problem-page.md](problem-page/problem-page.md) owns the page's layout, header, the choice between the three views, Previous and Next placement, and the Archive switch's placement.
- [testsolving/locked-problem.md](testsolving/locked-problem.md) owns the locked view and "Start testsolving", up to the moment the attempt exists.
- [testsolving/timed-attempt.md](testsolving/timed-attempt.md) owns the testsolving view from the moment the attempt exists to the moment it is solved, given up or out of time, including the countdown's refresh into the unlocked view.
- [testsolving/leaderboard.md](testsolving/leaderboard.md) owns the leaderboard; [problem-page/spoilers.md](problem-page/spoilers.md) owns Show spoilers and the read-only answer and solution; [problem-page/editing-the-problem.md](problem-page/editing-the-problem.md) owns the title, statement and answer editors; [problem-page/solutions.md](problem-page/solutions.md) owns Add Solution and the solution editor.

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
- Depth bar: `problem-page/discussion.md` is roughly 150 lines for a small feature. The problem page and the timed attempt will be longer; the error pages and the home page will be shorter. Completeness matters more than length. Every state, every variant row, every cancel/interrupt row must be accounted for, even if the answer is "no effect".
- If you find that the README's structure is wrong for something you discover (a document that should be split, two that should merge), make the change, update the structure and coverage table, and note why in the commit message.

You are done when the coverage table has no `not started` rows, the consistency pass is complete, and everything is committed.
