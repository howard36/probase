# Bug triage

A consolidated list of the defects and inconsistencies that the feature documents raised in their "Open questions and verification" sections and in their bodies. Each entry is read from the Probase source at commit `c38ff56` and its tests; the entries confirmed in the running app by the first local pass (a production build against a local database, driven by headless Chromium; see [verification](verification/README.md#results-so-far)) carry a **Status** line. None has been filed as an issue. The list exists so the product team can decide, item by item, whether to fix, to document as intended, or to leave.

## Summary

The documents raised about seventy suspected defects; merged by root cause they come to the 32 entries below, 6 of them high. The high ones:

- a security hole (an open redirect on the login page);
- two paths that lock people out entirely (a one-time invite with an expiry can never be accepted; the testsolver-type chooser cannot be used from the keyboard);
- a crash (a problem without a difficulty returns a 500 page to Serious testsolvers);
- a button that does two things at once (Give Up also submits the typed answer);
- the collection search box, which drops typed characters.

The largest clusters are:

- controls that copy the server's data once and never update it (click-to-edit fields, the heart, the Archive switch), which lets people overwrite each other silently;
- the testsolving path's interaction with the default ShortAnswer format and optional difficulty;
- prefetching, which both shows stale pages and creates records;
- accessibility, where several controls are clickable boxes that no keyboard or screen reader can use.

Every high and medium entry except B-10, B-16 and B-19 was confirmed in the running app.

| ID   | Title                                                                               | Severity | Area             | Decision needed |
| ---- | ----------------------------------------------------------------------------------- | -------- | ---------------- | --------------- |
| B-01 | The login page redirects signed-in visitors to another site                         | high     | Sign-in          | fix             |
| B-02 | A one-time invite that also has an expiry can never be accepted                     | high     | Invites          | fix             |
| B-03 | A problem without a difficulty crashes the problem page for Serious testsolvers     | high     | Testsolving      | fix             |
| B-04 | The testsolver-type chooser cannot be used from the keyboard                        | high     | Testsolving      | fix             |
| B-05 | Give Up also submits the answer in the box                                          | high     | Testsolving      | fix             |
| B-06 | The search box drops typed characters                                               | high     | Collection page  | fix             |
| B-07 | Enter in the search box clears the search and every filter                          | medium   | Collection page  | fix             |
| B-08 | Search matches the statements of locked problems                                    | medium   | Collection page  | fix             |
| B-09 | ShortAnswer and Proof collections get a digits-only box in timed attempts           | medium   | Testsolving      | product call    |
| B-10 | Submissions to an already-solved attempt still count                                | medium   | Testsolving      | fix             |
| B-11 | The test page skips the testsolver-type check                                       | medium   | Tests            | fix             |
| B-12 | Inline editors, the heart and the Archive switch never update from the server       | medium   | Problem page     | fix             |
| B-13 | Prefetched pages are shown up to five minutes stale                                 | medium   | Navigation       | product call    |
| B-14 | Viewing the collection page creates an author                                       | medium   | Collection page  | fix             |
| B-15 | Invites can lower a ViewOnly or SubmitOnly member's role                            | medium   | Invites          | product call    |
| B-16 | Signing in again attaches the new Google account instead of switching users         | medium   | Sign-in          | product call    |
| B-17 | "Add Solution" can create invisible duplicate solutions                             | medium   | Solutions        | fix             |
| B-18 | The first click on the add-problem "Submit" is lost while a box above it is open    | medium   | Add-problem form | fix             |
| B-19 | Hiding the spoilers throws away drafts inside them                                  | medium   | Spoilers         | fix             |
| B-20 | Keyboard and screen-reader gaps across the site                                     | medium   | Accessibility    | fix             |
| B-21 | A SubmitOnly member lands on "You need permission" after submitting                 | medium   | Add-problem form | fix             |
| B-22 | "Add Solution" is offered to ViewOnly members who will always be refused            | low      | Solutions        | fix             |
| B-23 | "Try again" on the error page cannot recover from a server failure                  | low      | Error pages      | fix             |
| B-24 | "You need permission" overflows on narrow screens                                   | low      | Error pages      | fix             |
| B-25 | Titles show math source to readers and on cards                                     | low      | Math rendering   | fix             |
| B-26 | Hand-typed page numbers of 0, negative or non-numeric are not corrected             | low      | Pagination       | fix             |
| B-27 | A filter change keeps the page number                                               | low      | Collection page  | fix             |
| B-28 | A non-numeric test address shows "Something went wrong" instead of "Page not found" | low      | Tests            | fix             |
| B-29 | Quick repeated clicks with failures leave the heart or switch out of step           | low      | Problem page     | fix             |
| B-30 | Two submissions in one subject at once collide on the problem ID                    | low      | Add-problem form | fix             |
| B-31 | Small copy and rendering slips                                                      | low      | Several          | fix             |
| B-32 | Product decisions the documents could not settle                                    | low      | Several          | product call    |

## High

### B-01: The login page redirects signed-in visitors to another site

- **Where the user meets it:** A link to Probase's login page, crafted by someone else, opened by a user who is already signed in.
- **What happens / what was expected:** The login page is meant to send a signed-in visitor only to a path on Probase. A return address of `/` followed by a tab and `/evil.example` passes the check; the server redirects to `/<tab>/evil.example`, and the browser, which drops tabs from addresses, goes to `//evil.example`, another site. Expected: the visitor stays on Probase.
- **Reproduce:** Signed in, open `/login?callbackUrl=%2F%09%2Fevil.example`. The browser leaves for `evil.example`.
- **Why (from the code):** `app/login/page.tsx:15-23` accepts any value matching `^\/(?![/\\])`, which excludes a second `/` or `\` but not whitespace; `redirect(callbackPath)` at line 33 passes the tab through.
- **Severity:** `high`. An open redirect on the sign-in page is a phishing aid, and the check exists precisely to prevent it.
- **Decision needed:** `fix`. Reject any control or whitespace character (or parse the value as a URL against the site's origin and require the same origin).
- **Raised by:** [signing in](entry/sign-in.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass: the server answered with `Location: /<tab>/evil.example` and headless Chromium requested `http://evil.example/`.

### B-02: A one-time invite that also has an expiry can never be accepted

- **Where the user meets it:** An invite link created as one-time with an expiry date, opened by someone who is not yet a member.
- **What happens / what was expected:** The page shows "{inviter} invited you!" and "Accept Invite"; pressing it shows the toast "Invite has expired" and grants nothing, even though the expiry is in the future and nobody has used the invite. Expected: the first person to accept joins.
- **Reproduce:** Create an invite with one-time use and an expiry a week away; open it as a non-member; press "Accept Invite".
- **Why (from the code):** `app/invite/[code]/actions.ts:70-76` consumes a one-time invite with an update whose condition is `expiresAt: null`, so an invite with an expiry is never matched and the transaction throws the "already used" error. No test covers the combination.
- **Severity:** `high`. It locks everyone out of an invite that looks valid, with a message that says the opposite of the truth.
- **Decision needed:** `fix`. Consume one-time invites with a separate "used" marker (or match `expiresAt` greater than now), not by requiring an empty expiry.
- **Raised by:** [invites](entry/invites.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass (fixture invite `once-expiring`).

### B-03: A problem without a difficulty crashes the problem page for Serious testsolvers

- **Where the user meets it:** A Serious testsolver opens a problem that has no difficulty, in a collection that requires testsolving. Possible whenever such a collection does not require a difficulty on its form, and for any problem with difficulty 0.
- **What happens / what was expected:** The page fails with "Something went wrong" (HTTP 500), and "Try again" shows it again. Expected: the problem shown locked (with some rule for its time limit) or not locked at all.
- **Reproduce:** In `ts`, as Sue Serious, open `G1` (no difficulty).
- **Why (from the code):** `app/c/[cid]/p/[pid]/view.ts:21-26` throws when the difficulty is null or zero, deliberately (a unit test expects the throw), and nothing prevents such problems in a testsolving collection.
- **Severity:** `high`. The user cannot get past the error, and every other user sees the problem normally.
- **Decision needed:** `fix`. Either require a difficulty whenever a collection requires testsolving, or give undifficulted problems a default time limit, or do not lock them.
- **Raised by:** [the problem page](problem-page/problem-page.md#open-questions-and-verification), [per-collection settings](cross-cutting/per-collection-settings.md#open-questions-and-verification), [the locked problem](testsolving/locked-problem.md#arrive)
- **Status:** Confirmed in the first local pass.

### B-04: The testsolver-type chooser cannot be used from the keyboard

- **Where the user meets it:** Any member who uses a keyboard (or a screen reader) and first opens a collection that requires testsolving.
- **What happens / what was expected:** The two choices, Serious and Casual, are clickable boxes that cannot take focus, and "Confirm" is disabled (so it cannot take focus either) until one is clicked. Tab reaches nothing on the page. Since every collection page and problem page sends an unchosen member here, a keyboard-only member, Admins included, cannot open the collection at all.
- **Reproduce:** As Uma Unchosen, open `/c/ts`, then press Tab repeatedly.
- **Why (from the code):** `components/choose-testsolver-type-page.tsx:37-67` renders the choices as `div`s with `onClick` and no role or tab stop; `:72-74` disables the only button.
- **Severity:** `high`. It locks a class of users out of whole collections.
- **Decision needed:** `fix`. Make the choices radio buttons (or buttons) in a form.
- **Raised by:** [the chooser](testsolving/choosing-a-testsolver-type.md#open-questions-and-verification), [keyboard and accessibility](cross-cutting/keyboard-and-accessibility.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass: six presses of Tab never focused either card.

### B-05: Give Up also submits the answer in the box

- **Where the user meets it:** A timed attempt, with something typed in the answer box, when the user presses "Give Up".
- **What happens / what was expected:** Two requests go out: the give-up, and the typed answer, which race. If the answer arrives first it is judged and counted (a correct one records a solve, a wrong one a wrong answer); if the give-up arrives first the answer is refused with the toast "Tried to submit after testsolve finished". With the box empty, the browser shows "Please fill out this field" on the box while the give-up goes through. Expected: Give Up gives up, and nothing else.
- **Reproduce:** Start an attempt, type any answer, press "Give Up".
- **Why (from the code):** `app/c/[cid]/p/[pid]/testsolve.tsx:66-71`: "Give Up" is a submit button inside the answer form with its own `onClick`, so it both gives up and submits the form.
- **Severity:** `high`. One common action does two things at once, can record a result the user did not intend, and shows an error for it.
- **Decision needed:** `fix`. Make "Give Up" `type="button"`.
- **Raised by:** [the timed attempt](testsolving/timed-attempt.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass: one press sent two requests; the give-up won and the answer was refused with the toast.

### B-06: The search box drops typed characters

- **Where the user meets it:** Typing in the collection page's search box at normal speed.
- **What happens / what was expected:** Letters vanish: typing "filler" quickly left "r" in the box and `?search=r` in the address. The cursor also jumps to the end. Expected: the box keeps what is typed and the list follows.
- **Reproduce:** On `/c/demo`, type a word quickly into "Search".
- **Why (from the code):** `components/problem-list-search.tsx:11-24`: the box's value is the search string the server last sent (`value={filter.search}`), and each keystroke only replaces the URL. Until the server answers, the box reverts, and the next keystroke is applied to the old value. The subject checkboxes and switches (`components/problem-list-filter.tsx:35-54`) have the same shape, so quick clicks cancel each other.
- **Severity:** `high`. Search is the main way to find a problem, and it silently loses input.
- **Decision needed:** `fix`. Keep the box's own text in local state and push it to the URL (debounced); do the same for the filters.
- **Raised by:** [search and filters](collection/search-and-filters.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass.

## Medium

### B-07: Enter in the search box clears the search and every filter

- **Where the user meets it:** Pressing Enter (or a phone keyboard's Search key) in the search box.
- **What happens / what was expected:** The page reloads fully as the bare collection address: the search, subjects, Archived, Unsolved only and page are all gone. Expected: nothing, or the same search applied.
- **Reproduce:** Open `/c/demo?subject=c&search=w`, press Enter in the search box.
- **Why (from the code):** `components/problem-list-search.tsx:20-27` wraps an unnamed input in a `<form>` with no action or submit handler, so Enter submits an empty GET form to the current path.
- **Severity:** `medium`. It loses the user's filters without warning in a very common gesture.
- **Decision needed:** `fix`. Prevent the form's default submission (or drop the form).
- **Raised by:** [search and filters](collection/search-and-filters.md#open-questions-and-verification), [keyboard and accessibility](cross-cutting/keyboard-and-accessibility.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass.

### B-08: Search matches the statements of locked problems

- **Where the user meets it:** A Serious testsolver searching the collection page.
- **What happens / what was expected:** A locked problem's card appears (padlocked) when the search matches words in its hidden statement, so a testsolver can learn what a problem says before testsolving it. Expected: locked problems matched by title only.
- **Reproduce:** As Sam Serious, search `/c/ts?search=this%20problem%20has`: the locked card for `G1` appears.
- **Why (from the code):** `lib/filter.ts:97-103` searches every problem's statement; the page applies it before deciding which cards are locked.
- **Severity:** `medium`. It undermines the testsolving lock, the feature Serious testsolving exists for.
- **Decision needed:** `fix`. Exclude the statements of problems locked for the user from the search.
- **Raised by:** [search and filters](collection/search-and-filters.md#open-questions-and-verification), [the collection page](collection/problem-list.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass.

### B-09: ShortAnswer and Proof collections get a digits-only box in timed attempts

- **Where the user meets it:** A timed attempt in a collection that requires testsolving and uses ShortAnswer (the default format) or Proof.
- **What happens / what was expected:** The answer box accepts only an optional minus sign and digits, but ShortAnswer answers are free text (the form's own placeholder is `$42$`), and Proof answers are always empty. Such problems can never be solved. Separately, the answer editor on the problem page accepts any text in every format, so an author can store an answer no box can type even in an Integer or AIME collection.
- **Reproduce:** In `ts`, open `C1` (answer `$\sqrt{2}$`) as a Serious testsolver and try to type the answer: the box keeps only `2`.
- **Why (from the code):** `app/c/[cid]/p/[pid]/testsolve.tsx:51-63` chooses the AIME box for AIME and the integer box for every other format; `app/c/[cid]/p/[pid]/editable-answer.tsx:26-34` is a free-text editor whatever the format; comparison is exact (`actions.ts`, `answer === problem.answer`).
- **Severity:** `medium`. It makes the default configuration unsuitable for testsolving without saying so.
- **Decision needed:** `product call`. Either accept free text (normalized) in ShortAnswer attempts, or forbid requiring testsolving with ShortAnswer and Proof; and validate the answer editor against the format.
- **Raised by:** [the timed attempt](testsolving/timed-attempt.md#open-questions-and-verification), [editing the problem](problem-page/editing-the-problem.md#open-questions-and-verification), [per-collection settings](cross-cutting/per-collection-settings.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass (the box accepted `2` from `$\sqrt{2}$`).

### B-10: Submissions to an already-solved attempt still count

- **Where the user meets it:** The same attempt open in two tabs, or Enter pressed again in the answer box while the page refreshes after a correct answer.
- **What happens / what was expected:** The extra submission is accepted: a wrong one adds a wrong answer to a solved attempt (shown on the leaderboard as "✕"), and a correct one moves the solve time later. Expected: submissions to a finished attempt refused.
- **Reproduce:** Solve an attempt in one tab; in a second tab still showing the testsolving view, submit any answer; check the leaderboard.
- **Why (from the code):** `app/c/[cid]/p/[pid]/actions.ts:314-418` (`submitTestsolve`) checks the submission limit, the deadline and `gaveUp`, but never `solvedAt`, in either the read or the guarded write.
- **Severity:** `medium`. It corrupts the leaderboard, which is the point of the feature.
- **Decision needed:** `fix`. Add `solvedAt: null` to the guarded update and refuse otherwise.
- **Raised by:** [the timed attempt](testsolving/timed-attempt.md#open-questions-and-verification), [the leaderboard](testsolving/leaderboard.md#edge-cases)

### B-11: The test page skips the testsolver-type check

- **Where the user meets it:** A member of a collection that requires testsolving who has not chosen a type, opening a test page by its address.
- **What happens / what was expected:** Every statement on the test is shown, with no padlocks, although the same member is sent to the chooser from every other page. They can read problems and then choose Serious. Expected: the chooser first, as elsewhere.
- **Reproduce:** As Uma Unchosen, open `/c/ts/t/anything-1`.
- **Why (from the code):** `app/c/[cid]/t/[testSlug]/page.tsx:31-36` checks sign-in and view access itself instead of using `requireCollectionAccess`, and nothing is locked for a member with no type (`lib/permissions.ts:142`). The page also ignores the collection in its address.
- **Severity:** `medium`. A hole in the testsolving lock, reachable by address.
- **Decision needed:** `fix`. Use the same access check as the other collection pages.
- **Raised by:** [the test page](collection/tests.md#open-questions-and-verification), [the chooser](testsolving/choosing-a-testsolver-type.md#edge-cases)
- **Status:** Confirmed in the first local pass.

### B-12: Inline editors, the heart and the Archive switch never update from the server

- **Where the user meets it:** Any problem page that stays open while someone else (or another tab) changes the title, statement, answer, solution, likes or archived state.
- **What happens / what was expected:** A refresh after any action rebuilds the page but these controls keep the value they were first given. An editor who then saves an unchanged field (a click and a click away is enough) silently puts back the old text over the other person's change. Expected: controls follow the server's data on refresh.
- **Reproduce:** Two browsers on `demo` `C1`; change the title in one; like the problem in the other (a refresh); the second still shows the old title, and clicking it and away saves the old title back.
- **Why (from the code):** `components/click-to-edit.tsx:33-34`, `components/likes.tsx:22-25`, `app/c/[cid]/p/[pid]/archive-toggle.tsx:14` copy their initial props into state and never resynchronize; every save sends the whole field, with no check for changes since loading.
- **Severity:** `medium`. Silent data loss between collaborators.
- **Decision needed:** `fix`. Resynchronize local state from props when not editing, and consider a stale-write check on save.
- **Raised by:** [freshness](cross-cutting/freshness.md#open-questions-and-verification), [click-to-edit](foundations/click-to-edit.md#open-questions-and-verification), [saving and feedback](foundations/saving-and-feedback.md#open-questions-and-verification), [editing the problem](problem-page/editing-the-problem.md#open-questions-and-verification), [the Archive switch](problem-page/archiving.md#open-questions-and-verification), [the heart](problem-page/likes.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass for the title (a comment from the other browser appeared on refresh; the title did not).

### B-13: Prefetched pages are shown up to five minutes stale

- **Where the user meets it:** Clicking a problem card, back link, chip or page number that was already on screen, on the production site.
- **What happens / what was expected:** The destination is shown from a copy fetched in the background when the link came into view, up to five minutes old, unless an action cleared the cache meanwhile. Another user's edit, comment or solve is missing until a reload.
- **Reproduce:** One browser views `/c/demo` for a few seconds; another edits `A23`'s statement; the first clicks the `A23` card and sees the old statement.
- **Why (from the code):** `prefetch={true}` on cards, back links, chips, sidebar links and page numbers (for example `app/c/[cid]/problem-card.tsx:49`); Next.js keeps full prefetches for five minutes by default.
- **Severity:** `medium`. Stale content with no hint, on the site's main navigation.
- **Decision needed:** `product call`. Drop `prefetch={true}` for dynamic pages, or shorten the stale time, trading the instant feel for freshness.
- **Raised by:** [navigation](foundations/navigation.md#open-questions-and-verification), [freshness](cross-cutting/freshness.md#open-questions-and-verification), [the problem page](problem-page/problem-page.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass.

### B-14: Viewing the collection page creates an author

- **Where the user meets it:** Any Admin or TeamMember opening a collection page on the production site.
- **What happens / what was expected:** The "Add Problem" link is prefetched, which runs the add-problem page, which creates the member's author. From then on the member is offered "Add Solution" on every problem without a solution, whether or not they ever meant to submit. Expected: viewing creates nothing.
- **Reproduce:** As a TeamMember with no author (Tia Member), view `/c/demo` for a few seconds on a production build; an author now exists.
- **Why (from the code):** `components/problem-list-sidebar.tsx:23-26` prefetches the add-problem page; `app/c/[cid]/add-problem/page.tsx:67` creates the author while rendering.
- **Severity:** `medium`. A read has a lasting side effect that changes what the user is offered.
- **Decision needed:** `fix`. Create the author when a problem or solution is submitted, not when the form renders (or stop prefetching the form).
- **Raised by:** [the collection page](collection/problem-list.md#open-questions-and-verification), [saving and feedback](foundations/saving-and-feedback.md#edge-cases), [the add-problem form](collection/adding-a-problem.md#arrive)
- **Status:** Confirmed in the first local pass (0 → 1 authors).

### B-15: Invites can lower a ViewOnly or SubmitOnly member's role

- **Where the user meets it:** A ViewOnly or SubmitOnly member accepting an invite with a lower role, or a reusable invite link reaching an existing member.
- **What happens / what was expected:** The member's role becomes the invite's. A ViewOnly member who accepts a SubmitOnly invite can no longer view the collection and lands on "You need permission". Such members are also shown "You've been invited to join" as if they were new, and a used one-time invite tells them it has expired. Expected, per the code's own comment: accepting "must never lower their access".
- **Reproduce:** As Vic Viewer (ViewOnly in `demo`), open `/invite/submit-demo` and accept.
- **Why (from the code):** `app/invite/[code]/actions.ts:48-52` and `lib/permissions.ts:78-86` protect only Admin and TeamMember; the upsert at `actions.ts:79-88` overwrites any other role.
- **Severity:** `medium`. Access silently lost.
- **Decision needed:** `product call`. Never lower a role on accept (take the higher of the two), or ask first.
- **Raised by:** [invites](entry/invites.md#open-questions-and-verification), [accounts and roles](foundations/accounts-and-roles.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass (ViewOnly became SubmitOnly and landed on "You need permission").

### B-16: Signing in again attaches the new Google account instead of switching users

- **Where the user meets it:** The invite page's wrong-domain state ("Log in with an @{domain} email…" with a "Log in with Google" button), or any sign-in while already signed in.
- **What happens / what was expected:** Picking a Google account Probase has not seen attaches it to the user already signed in: they stay the same Probase user but now carry the new account's email, which passes the invite's domain check, and that Google account will sign in as them from then on. Picking an account that belongs to another Probase user lands on the authentication library's own page. Expected (from the page's wording): signing in as the other account.
- **Reproduce:** Signed in, open a domain-limited invite with a non-matching email, press "Log in with Google", pick a different, new Google account.
- **Why (from the code):** The authentication library links an OAuth account to the current session's user when one exists (`@auth/core`, `handle-login.js`, around lines 200-212); Probase offers no sign-out.
- **Severity:** `medium`. Accounts get merged without the user realizing it.
- **Decision needed:** `product call`. Offer a real sign-out (and use it before a "switch account" sign-in), or decide that linking is intended and say so on the page.
- **Raised by:** [signing in](entry/sign-in.md#open-questions-and-verification), [invites](entry/invites.md#the-interaction-event-by-event), [accounts and roles](foundations/accounts-and-roles.md#the-session)

### B-17: "Add Solution" can create invisible duplicate solutions

- **Where the user meets it:** Adding the first solution to a problem.
- **What happens / what was expected:** The Add Solution "Submit" has no pending state and the server does not check for an existing solution, so a double click, two members adding at once, or a submit from a page loaded before someone else added one each create another solution. Only the first is ever shown; the rest cannot be seen, edited or removed through the interface, and a member's own solution can disappear from view the moment it succeeds.
- **Reproduce:** With the server's answer delayed, double-click Add Solution's "Submit": two solutions are stored.
- **Why (from the code):** `app/c/[cid]/p/[pid]/add-solution.tsx:43-45` (a plain button, no pending state); `app/c/[cid]/p/[pid]/actions.ts:499-560` (`addSolution` creates unconditionally); `types.ts` loads solutions unordered.
- **Severity:** `medium`. Lost work and hidden records.
- **Decision needed:** `fix`. Disable the button while pending, and refuse (or show) a second solution on the server.
- **Raised by:** [solutions](problem-page/solutions.md#open-questions-and-verification), [freshness](cross-cutting/freshness.md#open-questions-and-verification), [data model](foundations/data-model.md#solution)
- **Status:** Confirmed in the first local pass (two solutions stored after a double click with a 2-second delay).

### B-18: The first click on the add-problem "Submit" is lost while a box above it is open

- **Where the user meets it:** The add-problem form, when the user finishes typing the solution and clicks "Submit".
- **What happens / what was expected:** Pressing the button takes focus from the solution box, which closes and gets shorter; the button moves up out from under the pointer and the click does not land. Nothing is sent and nothing says so; a second click submits. Expected: one click submits.
- **Reproduce:** Fill the form, leaving the cursor in "SOLUTION", and click "Submit" once.
- **Why (from the code):** `components/click-to-edit.tsx:38-43` closes the editor on blur (autosaving fields), which happens on mouse-down, before the click completes; the layout shift moves the button (35 px in the local pass).
- **Severity:** `medium`. The main form's main button appears not to work.
- **Decision needed:** `fix`. Keep the field's height stable when it closes, or submit the form's current values without closing editors on blur of the submit button.
- **Raised by:** [the add-problem form](collection/adding-a-problem.md#open-questions-and-verification), [click-to-edit](foundations/click-to-edit.md#edge-cases)
- **Status:** Confirmed in the first local pass.

### B-19: Hiding the spoilers throws away drafts inside them

- **Where the user meets it:** Writing a solution (in the editor or the Add Solution box) and clicking "Hide spoilers" to reread the statement.
- **What happens / what was expected:** The contents are removed, not hidden, so the typed text is lost without warning; reopening shows an editor rebuilt from old data (and, if a save was pending, stale text that later refreshes do not correct). An open answer editor is saved instead, as a side effect of the click. Expected: hiding keeps drafts.
- **Reproduce:** Open the spoilers, click the solution, type, click "Hide spoilers", then "Show spoilers".
- **Why (from the code):** `app/c/[cid]/p/[pid]/spoilers.tsx:21` renders its children only while open.
- **Severity:** `medium`. Lost work in a normal flow.
- **Decision needed:** `fix`. Hide with CSS instead of unmounting.
- **Raised by:** [the spoilers](problem-page/spoilers.md#open-questions-and-verification), [solutions](problem-page/solutions.md#edge-cases), [editing the problem](problem-page/editing-the-problem.md#edge-cases)

### B-20: Keyboard and screen-reader gaps across the site

- **Where the user meets it:** Anyone using a keyboard or assistive technology.
- **What happens / what was expected:** Beyond [B-04](#b-04-the-testsolver-type-chooser-cannot-be-used-from-the-keyboard):
  - The heart and every click-to-edit field (title, statement, answer, solution) are clickable boxes that cannot take focus: a keyboard user cannot like a problem or edit anything.
  - Every page is titled "Probase", so no in-app navigation is announced and tabs cannot be told apart. Several pages have no level-1 heading.
  - The answer boxes, the add-problem fields and menus, the search box and the Add Solution box have no programmatic label (their captions are plain paragraphs). The search and comment boxes show no focus ring.
  - The countdown and the wrong-answer line are not announced. The leaderboard has no header row and marks the user's row by color only. The lightbulbs are hidden from screen readers, so difficulty is never conveyed.
  - Focus is dropped whenever an editor closes or a page changes.
- **Reproduce:** Tab through a problem page as an Admin: focus skips the title, statement and heart.
- **Why (from the code):** `components/likes.tsx:42`, `components/click-to-edit.tsx:93` (`div` with `onClick`); `app/layout.tsx:17` (a single static title); `components/label.tsx:2` (captions as `<p>`); `app/c/[cid]/p/[pid]/countdown-timer.tsx:35`, `testsolve.tsx:77`; `leaderboard.tsx:85-88`; `components/lightbulbs.tsx:10`.
- **Severity:** `medium`. Several core actions are impossible without a pointer.
- **Decision needed:** `fix`. Use buttons for clickable controls, real labels, per-page titles, and live regions for the timer and results.
- **Raised by:** [keyboard and accessibility](cross-cutting/keyboard-and-accessibility.md#open-questions-and-verification), [the heart](problem-page/likes.md#open-questions-and-verification), [click-to-edit](foundations/click-to-edit.md#open-questions-and-verification), [editing the problem](problem-page/editing-the-problem.md#open-questions-and-verification), [the leaderboard](testsolving/leaderboard.md#interactions-with-other-systems), [the problem page](problem-page/problem-page.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass for the heart and click-to-edit fields (not reachable with Tab) and the static page titles.

### B-21: A SubmitOnly member lands on "You need permission" after submitting

- **Where the user meets it:** A SubmitOnly member (who may add problems but not view the collection) submitting the add-problem form, or accepting a SubmitOnly invite.
- **What happens / what was expected:** The form succeeds and sends them to the new problem's page, which redirects them to "You need permission", the same page as a refusal. They never see confirmation that the problem was stored, and after accepting a SubmitOnly invite they have no route to the form at all. Expected: a confirmation page, and a link to the form.
- **Reproduce:** As Sid Submitter, submit `/c/demo/add-problem`.
- **Why (from the code):** `app/c/[cid]/add-problem/actions.ts:151` redirects every submitter to the problem page; `app/invite/[code]/actions.ts:107` redirects every new member to the collection page.
- **Severity:** `medium`. The one thing SubmitOnly members can do ends in an error-looking page.
- **Decision needed:** `fix`. Redirect SubmitOnly members to a confirmation (or back to an empty form).
- **Raised by:** [the add-problem form](collection/adding-a-problem.md#submit), [invites](entry/invites.md#open-questions-and-verification), [accounts and roles](foundations/accounts-and-roles.md#roles)
- **Status:** Confirmed in the first local pass (problem `C2` stored; landed on `/need-permission`).

## Low

### B-22: "Add Solution" is offered to ViewOnly members who will always be refused

- **Where the user meets it:** A ViewOnly member who kept an author from an earlier role.
- **What happens / what was expected:** The prompt appears on every problem without a solution; every submit fails with "You do not have permission to edit this collection". Expected: the prompt shown only to roles that may add.
- **Why (from the code):** `app/c/[cid]/p/[pid]/problem-page.tsx:120` checks only for an author; `actions.ts:532` checks the role.
- **Severity:** `low`. Rare, but a guaranteed dead end.
- **Decision needed:** `fix`. Check `canAddSolution` on the page too.
- **Raised by:** [solutions](problem-page/solutions.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass.

### B-23: "Try again" on the error page cannot recover from a server failure

- **What happens / what was expected:** "Try again" only redraws what the browser already has; after a server-side failure it shows "Something went wrong" again. Expected: a fresh attempt from the server, or a reload.
- **Why (from the code):** `app/error.tsx:23` calls `reset()` without refreshing the route.
- **Severity:** `low`.
- **Decision needed:** `fix`. Call `router.refresh()` together with `reset()`, or reload.
- **Raised by:** [the error pages](entry/error-pages.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass.

### B-24: "You need permission" overflows on narrow screens

- **What happens / what was expected:** On any window under 768 px the page scrolls sideways; at 375 px it is 297 px too wide. The other error pages cap their width.
- **Why (from the code):** `app/need-permission/page.tsx:6` (`w-128` without `max-w-full` or side padding).
- **Severity:** `low`.
- **Decision needed:** `fix`.
- **Raised by:** [the error pages](entry/error-pages.md#open-questions-and-verification), [narrow screens](cross-cutting/narrow-screens.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass (page 672 px wide in a 375 px window).

### B-25: Titles show math source to readers and on cards

- **What happens / what was expected:** A title containing `$x^2$` is typeset for users who can edit it and shown as source to everyone else, including on every problem card. Expected: the same rendering everywhere.
- **Why (from the code):** `app/c/[cid]/p/[pid]/title.tsx:25` and `app/c/[cid]/problem-card.tsx:57` print the title as text; the editor's display state renders it.
- **Severity:** `low`.
- **Decision needed:** `fix` (render everywhere, or nowhere).
- **Raised by:** [math rendering](cross-cutting/math-rendering.md#open-questions-and-verification), [editing the problem](problem-page/editing-the-problem.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass.

### B-26: Hand-typed page numbers of 0, negative or non-numeric are not corrected

- **What happens / what was expected:** `?page=0` shows an empty list with page links; negative values show an odd slice; non-numeric values show an empty list with an empty page row, and later filter changes write `page=NaN` back. Only numbers past the end are corrected.
- **Why (from the code):** `lib/filter.ts:31-32` parses without bounds; `app/c/[cid]/page.tsx:74` corrects only `page > numPages`.
- **Severity:** `low`.
- **Decision needed:** `fix`. Clamp to 1.
- **Raised by:** [pagination](collection/pagination.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass for `page=0`.

### B-27: A filter change keeps the page number

- **What happens / what was expected:** On page 3, ticking a subject shows page 3 of the new results (or its last page). Expected: page 1.
- **Why (from the code):** `components/problem-list-filter.tsx:39,45,51` and `problem-list-search.tsx:12` copy the whole filter, page included.
- **Severity:** `low`.
- **Decision needed:** `fix`.
- **Raised by:** [search and filters](collection/search-and-filters.md#open-questions-and-verification)

### B-28: A non-numeric test address shows "Something went wrong" instead of "Page not found"

- **Why (from the code):** `app/c/[cid]/t/[testSlug]/page.tsx:15-19` looks up `parseInt` of the last part, which can be `NaN`.
- **Severity:** `low`.
- **Decision needed:** `fix`.
- **Raised by:** [the test page](collection/tests.md#open-questions-and-verification), [the error pages](entry/error-pages.md#open-questions-and-verification)
- **Status:** Confirmed in the first local pass (`/c/ts/t/abc` returned 500).

### B-29: Quick repeated clicks with failures leave the heart or switch out of step

- **What happens / what was expected:** Each failure restores the state from before its own click, whenever it arrives; two failed clicks, or three clicks with a failure, can leave the heart or the Archive switch showing what the server does not hold. The two hearts drawn for each card (one per layout) also keep separate state across the 640 px breakpoint.
- **Why (from the code):** `components/likes.tsx:29-38`, `app/c/[cid]/p/[pid]/archive-toggle.tsx:19`, `app/c/[cid]/problem-card.tsx:63,82`.
- **Severity:** `low`.
- **Decision needed:** `fix`.
- **Raised by:** [the heart](problem-page/likes.md#open-questions-and-verification), [the Archive switch](problem-page/archiving.md#open-questions-and-verification), [saving and feedback](foundations/saving-and-feedback.md#optimistic-updates-and-rollback)

### B-30: Two submissions in one subject at once collide on the problem ID

- **What happens / what was expected:** Both are given the same next ID; the second fails with the generic error and must be resubmitted (its form is kept). Known and noted in the repository's own instructions.
- **Why (from the code):** `app/c/[cid]/add-problem/actions.ts:80-105` reads the last ID and writes the next without a lock or retry.
- **Severity:** `low`.
- **Decision needed:** `fix`. Retry on the unique-constraint error.
- **Raised by:** [data model](foundations/data-model.md#open-questions-and-verification), [the add-problem form](collection/adding-a-problem.md#open-questions-and-verification)

### B-31: Small copy and rendering slips

- **Severity:** `low`. **Decision needed:** `fix`.
- Messages written for developers: "No problem with id {n}" (an internal number), "Tried to submit before starting testsolve", "Problem difficulty should not be null", "session.email is null or undefined", "Problem not found" for a missing solution, and "You do not have permission to edit this collection" for starting a testsolve or adding a solution ([saving and feedback](foundations/saving-and-feedback.md#toasts)).
- The locked view promises that "a correct first submission" earns a leaderboard spot, while any solve ranks ([the locked problem](testsolving/locked-problem.md#open-questions-and-verification)).
- "({n}/5)" after a wrong answer counts answers left, which reads like answers used ([the timed attempt](testsolving/timed-attempt.md#edge-cases)).
- The chooser says "You can always switch to Casual later", but nothing links back to it ([the chooser](testsolving/choosing-a-testsolver-type.md#open-questions-and-verification)).
- "You need permission" tells users to "switch to an account with permission" with no way to sign out ([the error pages](entry/error-pages.md#open-questions-and-verification)).
- Sign-in failures land on the authentication library's unstyled pages, one of which calls an expired sign-in a "Server error" ([signing in](entry/sign-in.md#open-questions-and-verification)).
- Text typed in the comment box while a post is pending is erased when the post succeeds ([the discussion](problem-page/discussion.md#open-questions-and-verification)).
- A field containing the same text or formula twice gives the page duplicate keys, which React warns about and which can misplace pieces when the text changes ([math rendering](cross-cutting/math-rendering.md#open-questions-and-verification)).
- The integer box turns numbers of 22 or more digits into `1e+21` and loses precision from 16 digits ([the add-problem form](collection/adding-a-problem.md#open-questions-and-verification)).
- The sidebar's "active" highlight can only ever appear on "Page not found", and matches by prefix (`/c/topsoj-2` highlights TopsOJ) ([the home page](entry/home-page.md#open-questions-and-verification)).

### B-32: Product decisions the documents could not settle

- **Severity:** `low`. **Decision needed:** `product call`. Each is described as intended in its document; none is clearly wrong.
- There is no sign-out, and the session ends 30 days after sign-in regardless of use ([accounts and roles](foundations/accounts-and-roles.md#open-questions-and-verification)).
- Admins in a collection that requires testsolving must choose a testsolver type that has no effect on them; members of `topsoj` and `mgci` can switch to Casual by typing the chooser's address ([the chooser](testsolving/choosing-a-testsolver-type.md#open-questions-and-verification)).
- A collection that hides authors still shows commenters' and testsolvers' names ([the discussion](problem-page/discussion.md#open-questions-and-verification), [the leaderboard](testsolving/leaderboard.md#open-questions-and-verification)).
- The fifth wrong answer does not end the attempt; the user must give up or wait out the clock ([the timed attempt](testsolving/timed-attempt.md#open-questions-and-verification)).
- "Unsolved only" hides every attempted problem, including given-up and timed-out ones ([search and filters](collection/search-and-filters.md#open-questions-and-verification)).
- Previous and Next follow problem-ID arithmetic, not the list, and Next leads to "Page not found" after the last problem of a subject ([navigation](foundations/navigation.md#open-questions-and-verification)).
- A collection page has no way back to the home page or other collections, no heading, and never names the collection; the sidebar is not filtered by permission ([navigation](foundations/navigation.md#open-questions-and-verification), [the home page](entry/home-page.md#open-questions-and-verification)).
- Archived problems are invisible as such to anyone who cannot edit them, yet stay reachable, testsolvable and on test pages ([the Archive switch](problem-page/archiving.md#open-questions-and-verification)).
- A collection's existence is revealed to signed-out visitors (unknown addresses give "Page not found", real ones the login page) ([accounts and roles](foundations/accounts-and-roles.md#open-questions-and-verification)).
- The subject and difficulty cannot be changed after submission, an answer cannot be removed, and nothing can be deleted ([data model](foundations/data-model.md#open-questions-and-verification)).
- The collection's required-field settings are enforced only by the browser, not by the server ([per-collection settings](cross-cutting/per-collection-settings.md#open-questions-and-verification)).
- The sidebar takes 43% of a phone's width and cannot be hidden ([narrow screens](cross-cutting/narrow-screens.md#open-questions-and-verification)).
