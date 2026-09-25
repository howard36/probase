# Probase product description

A written description of the user experience of Probase: what the user sees, what they can do, and exactly what happens when they do it.

## Purpose

Probase is, from the user's point of view, a large state chart. The user moves through it with page visits, link clicks, form submissions, clicks on inline editors and toggles, and a handful of keyboard shortcuts (Enter, Shift/Ctrl/Cmd+Enter, Escape). Most of that behavior is defined implicitly, spread across the Next.js pages under `app/`, the server actions beside them, the permission predicates in `lib/permissions.ts`, a few shared client components, and the tests. There is no single place that says, in plain language, "when the user does X, this is what happens, and this is what happens if they do Y halfway through."

This project is that place. It describes the full experience a person has on the Probase web site: signed out, signing in with Google, accepting an invite, and working inside a collection in every role (Admin, TeamMember, ViewOnly, SubmitOnly) and every testsolver type (Serious, Casual, or not yet chosen). It describes the product as the code at the commit below ships it, with the per-collection configuration in `lib/collection-config.ts` as it stands and collection settings at their database defaults unless a document says otherwise.

The documents are for people who need to understand or change the product: designers, engineers, writers, testers, and anyone evaluating whether a behavior is intentional. They are written from the outside in. They describe the experience, not the implementation.

### What this is not

- Not API documentation. The bearer-token endpoint `GET /api/collections/[cid]/problems` is out of scope (see [Scope decisions](#scope-decisions)); its behavior is specified by `test/integration/api/collection-problems.test.ts`.
- Not organized by folder. The `app/`, `components/` and `lib/` folders are not described separately. A single behavior is described once, wherever the user encounters it.
- Not a technical design document. Where a technical detail is critical to understanding the experience, it appears in a block quote labeled `Technical note:` and nowhere else.

## Conventions

- Describe the experience, not the code. "The comment box empties once the server has stored the comment" rather than "`setText("")` runs in the action's `onSuccess`".
- Technical detail goes in block quotes, prefixed with `Technical note:`. Use it only when the mechanism changes what the user would expect.
- Use sentence case for headings.
- Name the vocabulary consistently. The [glossary](glossary.md) is the source of truth for terms like _collection_, _problem ID_, _role_, _author_, _locked_, _testsolve attempt_, _pending_ and _toast_.
- Every document ends with the Probase commit it was verified against and a list of open questions.
- When a behavior is surprising, say so and say why it is that way if the reason is known. Do not smooth it over.

## The work to be done

Each document describes one feature. Features are large things (the timed testsolve attempt) or small things (the heart that likes a problem), but each is described in full, including its edge cases and its interactions with other features.

### Document template

Every feature document follows the same skeleton so that documents are comparable and nothing is skipped.

1. **Summary.** One paragraph describing the feature abstractly. For example: "The discussion is the comment thread at the bottom of an unlocked problem page, where any member who can read the problem can post a comment for everyone else in the collection to read."
2. **The simple case.** The common path in prose.
3. **The interaction, event by event.** The five phases of a page or form lifecycle: **Arrive** (the route, what loads, what is shown, focused, or prefilled), **Leave untouched** (back, a link out, reload, before changing anything: is anything recorded?), **Begin editing** (the first change: what becomes different on screen, what validation runs, what becomes available), **While editing** (typing, live normalization, what else can be done meanwhile, and for one-click controls, the time the request is in flight), and **Submit** (what is sent, what is optimistic, what is disabled meanwhile, the success and failure paths, where the user lands). For a one-click control such as the heart or the Archive switch, the click itself is _begin editing_, the request in flight is _while editing_, and the server's answer is _submit_. Include a small state diagram (Mermaid `stateDiagram-v2`) of the states the user passes through.
4. **Modifiers.** The variant axis: what the user is and what state the thing is in when the interaction happens. The rows are the same in every document, in this order:
   - **Role**: signed out, no permission, SubmitOnly, ViewOnly, TeamMember, Admin.
   - **Authorship**: whether the user is an author of the problem (or of the solution).
   - **Testsolver type**: Serious, Casual, or not chosen, in a collection that requires testsolving or one that does not.
   - **Record state**: the problem's state (archived, locked, testsolving, unlocked; has an answer, a solution, a difficulty) or the invite's state (reusable, one-time, expired, domain-restricted).
   - **Collection settings**: the collection's answer format, required fields, author visibility, and the code-level configuration in `lib/collection-config.ts`.
   - **Keys**: Enter, Shift/Ctrl/Cmd+Enter, Escape, Tab.

   Two columns: **At arrival** and **During editing**.

5. **Cancel and interrupt.** The same checklist in every document, in this order, with columns **Before editing** and **While editing**:
   1. Escape or Discard
   2. Browser back or forward
   3. Reload
   4. Tab or window closed
   5. A link inside the app followed
   6. Network lost mid-request
   7. Request fails or returns an error
   8. Session ends
   9. Access changes
   10. Same record changed in another tab
   11. Same record changed by another user
   12. Autofill writes into the field
   13. The window loses focus
   14. The testsolve time limit passes

   The words are defined in the glossary's [events that end or interrupt](glossary.md#events-that-end-or-interrupt) section.

6. **Interactions with other systems.** One bold-led paragraph per concern, in this order: **Permissions.** **Testsolving locks.** **Per-collection settings.** **Validation and errors.** **Unsaved changes.** **Optimistic updates.** **Freshness and other users.** **URL state.** **Math rendering.** **Offline.** **Keyboard and accessibility.** **Narrow screens.** **Side effects.** A concern with nothing to say gets one line saying so.
7. **Edge cases.** Anything a user could notice that is not covered above.
8. **Open questions and verification.** The Probase commit the document was verified against, and any behavior that could not be confirmed.

Item 5 matters most. Asking the same interrupt questions of every feature is how gaps and inconsistencies are found.

### Method

For each document:

1. Read the page (`page.tsx`), the components it renders, and the server actions it calls (`actions.ts` beside the page).
2. Read the permission and view rules the feature depends on: `lib/permissions.ts`, `lib/collection-access.ts`, `app/c/[cid]/p/[pid]/view.ts`, `lib/testsolve.ts`, `lib/filter.ts`, `lib/collection-config.ts`.
3. Read the matching tests in `test/`. The integration tests for actions (`test/integration/actions/*.test.ts`), for pages (`test/integration/pages/*.test.ts`) and for collection access (`test/integration/lib/collection-access.test.ts`), and the unit tests for the view, lock, filter and permission rules (`test/unit/app/problem-view.test.ts`, `test/unit/lib/problem-lock.test.ts`, `test/unit/lib/permissions.test.ts`, `test/unit/lib/apply-filter.test.ts`) are close to executable specifications of the edge cases.
4. Draft the document.
5. Try anything ambiguous in the running app (a local dev server; see [verification](verification/README.md)). Tests settle "what happens"; the running app settles how it feels, what is visible while a request is in flight, and what the timing is like.
6. Record the commit verified against.

### Verification

Drafting reads the code; verification watches the product. The `verification/` directory holds one checklist per cluster of documents, each item a single observable claim with setup, steps, expected result, a priority, and the role or condition it needs. A tester runs them on a local instance, records `pass`, `fail`, or `blocked` in the Result column, and files every failure in `bug-triage.md` with the item's ID. A document moves from `drafted` to `verified` in the coverage table only when every P1 and P2 item for it has passed or been filed.

`bug-triage.md` is the other half: every behavior the documents flagged as a likely defect, deduplicated, with reproduction steps, the reason in the code, a severity, and the decision the product team needs to make. Entries confirmed in the running app carry a Status line.

### Order of work

1. **Pilot: the discussion** (`problem-page/discussion.md`). Small and self-contained, with a form, a validation rule, a submit, and a failure path. Used to settle the template, tone, and depth.
2. **Foundations: the data model, accounts and roles, navigation, saving and feedback, and the click-to-edit field.** Everything else refers to them.
3. **The problem page and testsolving.** The bulk of the experience and the hardest part: one page with three views (locked, testsolving, unlocked) whose hand-offs must agree. Written third so the template is already proven.
4. **Everything else.** Once the template and the exemplars exist, the remaining documents can be drafted in parallel, followed by a consistency pass and a verification pass across the whole set.

Progress is tracked in the [coverage table](#coverage) below.

### Scope decisions

- **Where this lives.** This description is a self-contained folder inside the Probase repository, so it travels with the code it describes. Nothing outside `product-description/` is changed by this work. Because the folder's own commits move `HEAD`, the "Probase commit" every document cites is the latest commit that touches anything _outside_ this folder: `git log -1 --format=%h -- . ':(exclude)product-description'`.
- **The API and the operator scripts are out of scope.** `GET /api/collections/[cid]/problems` (bearer-token export for integrators) and the scripts in `scripts/` (`generate-invite-codes.ts`, `generate-api-token.ts`, `prod.ts`) serve integrators and operators, not people using the site. They are a different surface; a separate description could cover them later.
- **Google's own screens are out of scope.** The description follows the user to the Google account chooser and picks them up again when they come back. What Google shows in between is not Probase's.
- **Records with no UI are described where the user meets them.** Tests, collections, invites, API tokens and role changes are created directly in the database. The documents say so where it matters (for example, the [test page](collection/tests.md) is reached only from a problem's test chips) rather than describing a management UI that does not exist.
- **Roles are a variant, not a separate description.** The four roles and the testsolver types change what a page shows far more than how it behaves, so every document covers all of them in its Modifiers table instead of there being one description per role.
- **Per-collection configuration in code is described as shipped.** `lib/collection-config.ts` names specific collections (`cmimc`, `otis-mock-aime`, `topsoj`, `mgci`). The documents describe what those entries do and what every other collection gets; [per-collection settings](cross-cutting/per-collection-settings.md) owns the list.
- **Interaction shape.** The unit of interaction is a page or form lifecycle and its phases are arrive, leave untouched, begin editing, while editing, and submit. The variant rows, the interrupt list and the order of cross-cutting concerns are fixed as written in the document template above.
- **Numbered rules.** These are prose documents, not numbered specifications. Stable heading anchors are enough for cross-references.

## Structure

```
README.md                        this file
goal.md                          the standing instructions for whoever drafts
AGENTS.md, CLAUDE.md             entry points for agents: read README.md, then goal.md
glossary.md                      shared vocabulary
bug-triage.md                    suspected defects collected from every document, with repro steps and decisions needed

verification/
  README.md                      how to run a verification pass and record results
  foundations-and-entry.md       checklists for foundations/ and entry/
  collection.md                  checklists for collection/
  problem-page.md                checklists for problem-page/
  testsolving.md                 checklists for testsolving/
  cross-cutting.md               checklists for cross-cutting/

foundations/
  data-model.md                  collections, problems and their IDs, authors, solutions, comments,
                                 likes, tests, testsolve attempts and invites, in user terms
  accounts-and-roles.md          Google sign-in, the session, the four roles, authorship,
                                 testsolver types, and who may do what
  navigation.md                  the routes, the redirects and the order they are checked,
                                 what the URL carries, back links
  saving-and-feedback.md         what "saved" means, pending buttons, error toasts,
                                 optimistic updates and their rollback, when a page refreshes
  click-to-edit.md               the inline editor behind the title, statement, answer and
                                 solution fields and most of the add-problem form

entry/
  home-page.md                   the home page and the sidebar
  sign-in.md                     the login page, the Google button, returning to where you were
  invites.md                     an invite link and its outcomes
  error-pages.md                 page not found, you need permission, something went wrong

collection/
  problem-list.md                the collection page: cards, order, locked cards
  search-and-filters.md          the search box, subject checkboxes, Archived and Unsolved only
  pagination.md                  pages of 20, the page window, a page past the end
  adding-a-problem.md            the add-problem form and how problem IDs are assigned
  tests.md                       the test page reached from a problem's test chips

problem-page/
  problem-page.md                the problem page: header, the three views, Previous and Next
  editing-the-problem.md         editing the title, statement and answer in place
  spoilers.md                    Show spoilers, and the answer and solution as read
  solutions.md                   adding the first solution and editing a solution
  discussion.md                  the comment form and the comments (the pilot)
  likes.md                       the heart on problem cards and on the problem page
  archiving.md                   the Archive switch

testsolving/
  choosing-a-testsolver-type.md  the Serious or Casual chooser
  locked-problem.md              "Testsolve to view" and Start testsolving
  timed-attempt.md               the answer box, Submit, Give Up and the countdown
  leaderboard.md                 ranks, and who sees which rows

cross-cutting/
  math-rendering.md              LaTeX delimiters and how text with math is shown
  freshness.md                   what updates without a reload; other tabs and other users
  per-collection-settings.md     collection fields and the code-level configuration
  keyboard-and-accessibility.md  shortcuts, focus, and what a keyboard or screen reader can reach
  narrow-screens.md              what changes on a phone-sized window
```

## Coverage

Status is one of `not started`, `drafted`, or `verified`.

| Document                                    | Status      |
| ------------------------------------------- | ----------- |
| glossary.md                                 | drafted     |
| bug-triage.md                               | drafted     |
| verification/ (5 checklists)                | not started |
| foundations/data-model.md                   | drafted     |
| foundations/accounts-and-roles.md           | drafted     |
| foundations/navigation.md                   | drafted     |
| foundations/saving-and-feedback.md          | drafted     |
| foundations/click-to-edit.md                | drafted     |
| entry/home-page.md                          | drafted     |
| entry/sign-in.md                            | drafted     |
| entry/invites.md                            | drafted     |
| entry/error-pages.md                        | drafted     |
| collection/problem-list.md                  | drafted     |
| collection/search-and-filters.md            | drafted     |
| collection/pagination.md                    | drafted     |
| collection/adding-a-problem.md              | drafted     |
| collection/tests.md                         | drafted     |
| problem-page/problem-page.md                | drafted     |
| problem-page/editing-the-problem.md         | drafted     |
| problem-page/spoilers.md                    | drafted     |
| problem-page/solutions.md                   | drafted     |
| problem-page/discussion.md                  | drafted     |
| problem-page/likes.md                       | drafted     |
| problem-page/archiving.md                   | drafted     |
| testsolving/choosing-a-testsolver-type.md   | drafted     |
| testsolving/locked-problem.md               | drafted     |
| testsolving/timed-attempt.md                | drafted     |
| testsolving/leaderboard.md                  | drafted     |
| cross-cutting/math-rendering.md             | drafted     |
| cross-cutting/freshness.md                  | drafted     |
| cross-cutting/per-collection-settings.md    | drafted     |
| cross-cutting/keyboard-and-accessibility.md | drafted     |
| cross-cutting/narrow-screens.md             | drafted     |

## Reference

The source of truth is the Probase repository this folder lives in (`https://github.com/howard36/probase`). Paths below are relative to its root. The relevant locations are:

- `app/`: every page the user can reach. `app/page.tsx` (home), `app/login/`, `app/invite/[code]/`, `app/need-permission/`, `app/not-found.tsx`, `app/error.tsx`, and everything under `app/c/[cid]/` (a collection).
- `app/c/[cid]/page.tsx`, `problem-list.tsx`, `problem-card.tsx`: the collection page.
- `app/c/[cid]/p/[pid]/`: the problem page. `page.tsx` loads it, `view.ts` decides locked / testsolving / unlocked, `problem-page.tsx` lays it out, `actions.ts` holds every server action the page calls.
- `app/c/[cid]/add-problem/`, `app/c/[cid]/choose-testsolver-type/`, `app/c/[cid]/t/[testSlug]/`: the add-problem form, the testsolver-type chooser, the test page.
- `lib/permissions.ts`, `lib/collection-access.ts`, `lib/current-user.ts`: who is signed in, what their role lets them do, and the redirects a collection page runs through.
- `lib/testsolve.ts`: the time limit, the grace buffer, the submission limit.
- `lib/filter.ts`: how the collection page's search, subject, archived, unsolved-only and page settings are read from and written to the URL.
- `lib/collection-config.ts`: the sidebar list, collections that force serious testsolving, custom difficulty labels.
- `lib/server-actions.ts`, `lib/toast.ts`, `components/toaster.tsx`, `components/submit-button.tsx`: how an action's result reaches the user.
- `components/`: shared UI. `click-to-edit*.tsx` (the inline editor), `aime-input.tsx` and `integer-input.tsx` (answer boxes), `katex.tsx` (math rendering), `likes.tsx`, `lightbulbs.tsx`, `sidebar.tsx`, the `problem-list-*` sidebar components.
- `auth.ts`: Google sign-in and the session.
- `prisma/schema.prisma`: the records and their defaults. `prisma/seed.mjs`: the demo data a local instance starts with.
- `test/`: behavioral tests. See [Method](#method).
