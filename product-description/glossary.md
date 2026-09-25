# Glossary

The vocabulary used across these documents. When a document uses one of these words, it means exactly this. Where Probase's interface has its own wording, the term uses it and says so.

## The site

**Probase.** The web site this description covers: a private problem database where members of a contest team write, review and testsolve math problems. Every page shares one root layout with the error [toast](#interface) area in the bottom-right corner.

**Home page.** The page at `/`. A short welcome and the [sidebar](#interface). It is the only page that links to collections, and it shows the same sidebar links to everyone, signed in or not.

**Collection page.** The page at `/c/{cid}` listing a collection's problems as [cards](#interface), with the search box and filters beside them. Also called "the problem list" when the list itself is meant.

**Problem page.** The page at `/c/{cid}/p/{pid}` for one problem. It shows one of three [views](#testsolving): locked, testsolving, or unlocked.

**Add-problem page.** The page at `/c/{cid}/add-problem` holding the form that submits a new problem.

**Test page.** The page at `/c/{cid}/t/{name-slug}-{testId}` listing a [test](#records)'s problems in order.

**Chooser.** The page at `/c/{cid}/choose-testsolver-type` titled "Choose your testsolving style", where a member of a collection that [requires testsolving](#testsolving) picks Serious or Casual.

**Invite page.** The page at `/invite/{code}` that an [invite](#records) link opens.

**Login page.** The page at `/login`, titled "Log in to Probase", with one "Log in with Google" button.

**Error pages.** The three pages a user lands on when they cannot go on: "Page not found" (unknown collection, problem, test or invite), "You need permission" (at `/need-permission`), and "Something went wrong" (an unexpected failure while loading a page, with a "Try again" button).

## Records

**Collection.** A private set of problems belonging to one contest team, identified in URLs by a short slug called its _cid_ (`cmimc`, `demo`). A collection has a name, members (people with a [permission](#people-and-access) on it), [authors](#people-and-access), problems, tests and invites, and a handful of [collection settings](#collection-settings). Collections are created in the database; there is no UI for it.

**Problem.** One math problem in a collection. It has a [problem ID](#records), a title, a [subject](#records), a statement, and optionally an [answer](#records), a [difficulty](#records), one or more [solutions](#records), [comments](#records), [likes](#records), and [testsolve attempts](#testsolving). Problems are never deleted through the UI; they can be [archived](#records).

**Problem ID.** The short code a problem is known by inside its collection, such as `A1` or `N12`: the [subject](#records)'s letter (A, C, G, N) followed by a number. It appears in URLs and before the title. A new problem gets the next number after the most recently created problem whose ID starts with that letter. IDs are unique within a collection, not across collections. Also written _pid_.

**Subject.** One of four fixed categories: Algebra, Combinatorics, Geometry, Number Theory. Each has a letter (A, C, G, N) used in problem IDs and in the collection page's URL, and a color: blue, amber, green, and red.

**Statement.** The text of the problem, which may contain [math](#interface). Required, and never empty once saved.

**Answer.** The expected final answer. Three states matter: _no answer field_ (the answer is absent; the problem page offers no answer and no answer editor), _empty answer_ (the answer is an empty string, which is how "no answer yet, add one later" is stored), and _an answer_. A timed attempt compares a submission against the answer character for character.

**Difficulty.** A whole number from 1 to 5, shown as that many lit lightbulbs out of five. On the add-problem form the five levels are labeled "Very easy" to "Very hard" (or with a collection's own labels). It may be absent; a difficulty of 0 (which only seeded data has) is shown as no lightbulbs. In a collection that requires testsolving, the difficulty sets the [time limit](#testsolving).

**Solution.** A written solution to a problem, with its own [authors](#people-and-access). A problem can hold several in the database, but the problem page shows only the first; when there is none, an author may add one.

**Comment.** A message in a problem's [discussion](#interface). It records its text, the user who posted it (shown by their Google name) and when. Comments cannot be edited or deleted through the UI.

**Like.** One user's mark on one problem, shown as a heart and a count. A user can like a problem at most once. Submitting a problem likes it on the submitter's behalf.

**Archived.** A problem state set by the Archive switch on the problem page. An archived problem is hidden from the collection page unless the Archived filter is on, in which case _only_ archived problems are shown. Archiving hides nothing else: the problem page, its links, and the test page still show it.

**Test.** A named, ordered selection of a collection's problems (for example a mock contest). Tests are created in the database; a problem that belongs to tests shows one gray chip per test, which leads to the [test page](#the-site).

**Invite.** A link, `/invite/{code}`, that gives whoever accepts it a [role](#people-and-access) in one collection. An invite may be _reusable_ (any number of people), _one-time_ (it [expires](#records) the moment the first person accepts it), limited to an _email domain_ (only Google accounts ending in `@{domain}` may accept), and may have an _expiry_ time. Invites are created in the database or by an operator script.

**Expired.** An invite whose expiry time is now or in the past. A one-time invite is expired by stamping the moment it was accepted as its expiry. An invite without an expiry never expires.

## People and access

**User.** A person who has signed in with Google at least once. Probase knows their Google name, email address and picture, and uses the name in comments and on the leaderboard.

**Signed in / signed out.** Signed in means the browser holds a valid Probase session; see [session](#people-and-access). There is no sign-out control anywhere in Probase.

**Session.** The browser's proof of sign-in, created when Google sign-in completes and valid for 30 days. Nothing on Probase's pages asks for it to be renewed, so in practice it ends 30 days after sign-in however much the site is used (see [accounts and roles](foundations/accounts-and-roles.md)). When it ends, the user is simply signed out; nothing warns them first.

**Member.** A user with a [permission](#people-and-access) on a collection, whatever its [role](#people-and-access). "Full member" means Admin or TeamMember.

**Permission.** The record that gives one user one [role](#people-and-access) in one collection, together with their [testsolver type](#testsolving) there. A user has at most one permission per collection. Permissions are created by accepting an invite or directly in the database; there is no UI to change or remove one.

**Role.** What a member may do in a collection. Probase calls it the access level and has four: **Admin**, **TeamMember**, **ViewOnly**, **SubmitOnly**. In short: Admin and TeamMember can read, add problems, add solutions and comment, and edit what they authored (an Admin can edit everything); ViewOnly can read, like and comment but not add or edit; SubmitOnly can add problems but cannot open the collection at all. [Accounts and roles](foundations/accounts-and-roles.md) has the full table.

**Can view.** A member can view a collection when their role is Admin, TeamMember or ViewOnly. Only those members can open the collection page, problem pages and test pages; everyone else is sent to "You need permission".

**Author.** A per-collection pen name that problems and solutions are attributed to. A user gets an author in a collection the first time they open that collection's add-problem page; it is named after their Google name at that moment and never renamed. Authors can also exist without a user (for example "Default Author" in the demo data). "Written by {author}" appears under a problem's statement when the collection shows authors, or to an Admin.

**Authorship.** Whether the signed-in user's author in the collection is among a problem's (or a solution's) authors. A TeamMember or SubmitOnly member can edit a problem only when they have authorship of it; an Admin can edit every problem; a ViewOnly member never can.

**Can edit.** Shorthand for "is an Admin, or is a TeamMember or SubmitOnly member with authorship". A user who can edit a problem sees its title, statement and answer as [click-to-edit](#interface) fields, sees the Archive switch, sees every row of the leaderboard, and is never asked to testsolve it.

## Testsolving

**Requires testsolving.** A collection setting. In a collection that requires testsolving, every member who can view it must first choose a [testsolver type](#testsolving) on the [chooser](#the-site), and Serious testsolvers must [testsolve](#testsolving) a problem before they can read it. In a collection that does not, none of this applies and there is no leaderboard.

**Testsolver type.** A member's choice, per collection: **Serious** (problems are hidden until the member starts a timed attempt) or **Casual** (everything is visible at once). _Not chosen_ means the member has neither yet. Some collections skip the choice and make every new member Serious; see [per-collection settings](cross-cutting/per-collection-settings.md).

**Serious period.** The moment from which a Serious testsolver's problems are hidden. Choosing a type on the chooser, or joining a collection that forces Serious testsolving, dates it from the collection's creation, so in practice every problem in the collection is hidden. Problems created before the serious period began are not hidden.

**Needs to testsolve.** A problem needs testsolving by a user when the collection requires testsolving, the user is not Casual, the user has a serious period that began before the problem was created, and the user cannot edit the problem.

**Testsolve attempt.** The record of one user's timed try at one problem: when it started, how many answers were submitted, whether and when it was solved, and whether the user gave up. There is at most one per user per problem, so a problem can be testsolved once. Also written _attempt_.

**Time limit.** How long an attempt lasts: 5 minutes plus 5 minutes per difficulty level, so 10, 15, 20, 25 or 30 minutes for difficulty 1 to 5. The countdown on the page runs to the end of the time limit.

**Grace buffer.** Ten seconds past the time limit during which the server still accepts a submitted answer, to absorb network delay. It applies to Submit, not to Give Up, and the page itself does not show it.

**Submission limit.** Five answers per attempt. After the fifth, no more are accepted.

**Solved / gave up / out of time.** The three ways an attempt finishes: a submitted answer matched the problem's answer exactly; the user pressed Give Up; or the time limit passed. A finished attempt unlocks the problem for that user for good.

**Views.** What the problem page shows a user, decided on the server each time the page loads. **Locked**: the user needs to testsolve the problem and has not started; only the title, chips, heart, lightbulbs and the page's navigation are shown, with "Testsolve to view" and a Start testsolving button. **Testsolving**: the user's attempt is running; the statement, an answer box, Submit, Give Up and the countdown are shown, and nothing else. **Unlocked**: everything the user is allowed to see. A locked or testsolving problem's statement (while locked), answer, solutions, comments and other users' names are never sent to the browser.

**Locked.** In the problem page's view, and on problem cards and test cards: the user needs to testsolve the problem and has not started an attempt. A locked card shows a padlock and "Testsolve to view" in place of the statement.

**Leaderboard.** The ranked list of attempts on an unlocked problem in a collection that requires testsolving. Solved attempts rank by fewest wrong answers, then fastest time.

## Collection settings

**Collection settings.** Per-collection options stored with the collection and changed only in the database: the _answer format_ (ShortAnswer, Integer or AIME; Proof also exists but has no answer field in the form), whether the answer, solution and difficulty are _required_ on the add-problem form, whether the collection _shows authors_, and whether it [requires testsolving](#testsolving). Defaults: ShortAnswer, all three fields required, testsolving not required. Showing authors has no default and is set when the collection is created; the demo collection hides them.

**Code-level configuration.** Settings that name specific collections in `lib/collection-config.ts` rather than living in the database: which collections the sidebar lists, which collections make every new member a Serious testsolver, and which collections have their own difficulty labels. [Per-collection settings](cross-cutting/per-collection-settings.md) lists them.

## Interaction

**Page lifecycle.** The unit of interaction these documents narrate, in five phases: **arrive** (the page loads and shows what it shows), **leave untouched** (the user goes elsewhere without changing anything), **begin editing** (the first change: a keystroke, a click into an editor, a click on a toggle), **while editing** (the user keeps working, or a one-click control's request is in flight), and **submit** (the change is sent and the server answers).

**Action.** A request from the page to the server that changes something: post a comment, like, save a field, start or submit an attempt, accept an invite, choose a testsolver type, add a problem or solution. Every action answers either _ok_ or an _error_ with a message; the message is shown as a [toast](#interface). An action never makes the page show a raw technical error.

**Saved.** A change is saved when the server has stored it and answered ok. Nothing in Probase is saved in the browser: there are no drafts, and text typed but not submitted is gone after a reload, a tab close, or navigating to another page.

**Pending.** The time between sending an action and the server's answer. Some buttons show a spinner and disable themselves while their form is pending; [saving and feedback](foundations/saving-and-feedback.md) says which ones actually do.

**Optimistic update.** Changing what the page shows the moment the user acts, before the server answers, and changing it back (_rolling back_) if the server answers with an error. The heart, the Archive switch and the click-to-edit fields do this. Other forms wait for the server.

**Rebuild.** The collection page being built again on the server with the current URL's search, filters and page, after one of them changes or after a successful like on a card. A rebuild is the collection page's form of a [refresh](#interaction): cards are redrawn from the server's current data, while hearts that stay on screen keep their own state.

**Refresh.** The page asking the server for a fresh copy of itself without a full browser reload, keeping scroll position and any typed text in components that stay on screen. It happens after most successful actions (the server marks the page stale as part of the action) and, on the problem page, when an attempt starts, finishes, or runs out of time.

**Inline editing.** Changing a field in place on the page it is shown on, rather than on a separate form. See [click-to-edit](#interface).

## Input

**Enter.** In a single-line click-to-edit field, saves. In a multi-line field or the comment box, starts a new line.

**Shift/Ctrl/Cmd+Enter.** Enter with Shift, Ctrl or Cmd (on macOS) held. In a multi-line click-to-edit field and in the Add Solution box, saves or submits, the same as clicking the button under it. It does nothing special in the comment box.

**Escape.** In a click-to-edit field or the Add Solution box, abandons what was typed. Elsewhere it does nothing.

**Blur.** A field losing keyboard focus, by Tab, by a click elsewhere, or by the window losing focus. A single-line click-to-edit field saves on blur; so does a multi-line one that autosaves (on the add-problem form).

## Events that end or interrupt

These are the rows of every document's "Cancel and interrupt" table, in this order.

**Escape or Discard.** The user's explicit abandon: the Escape key, or a Discard button where there is one. Where neither exists, the row says so.

**Browser back or forward.** The browser's history buttons or gestures. Probase pages push ordinary history entries, except that changing the collection page's search and filters replaces the current entry instead of adding one.

**Reload.** A full browser reload of the current page. Everything unsaved is lost and the page is rebuilt from the server.

**Tab or window closed.** The page goes away without the user choosing a destination. Probase never asks "leave this page?"; nothing warns about unsaved text.

**A link inside the app followed.** The user clicks a Probase link: a card, a chip, a back link, Previous or Next, the sidebar, a pagination number. The destination loads without a full browser reload, and client state on the old page is dropped.

**Network lost mid-request.** The connection fails while an action is pending, so no answer arrives. The user sees the generic error toast ("Something went wrong. Please try again.") and the page stays as it was, or rolls back an optimistic update.

**Request fails or returns an error.** The server answers with an error: a validation failure, a permission failure, a rule such as the submission limit, or an unexpected exception (which the user sees only as the generic message).

**Session ends.** The [session](#people-and-access) expires or its cookie is removed while a page is open. The next page load sends the user to the login page (or shows a signed-out state); the next action answers "Not signed in".

**Access changes.** The user's role in the collection is changed or removed, or their testsolver type changes, while a page is open (in the database, or by accepting an invite in another tab). Open pages keep showing what they showed; the next action or page load uses the new access.

**Same record changed in another tab.** The same user changes the same problem, comment thread, attempt or invite from another browser tab or device.

**Same record changed by another user.** A different user changes it.

**Autofill writes into the field.** The browser fills a field from saved form history or a password manager, as if the user had typed it.

**The window loses focus.** The user switches to another window or application. For a click-to-edit field this is a [blur](#input).

**The testsolve time limit passes.** The user's running attempt reaches the end of its [time limit](#testsolving). Only relevant on a problem page in the testsolving view, and on pages that show whether a problem is locked.

## Interface

**Sidebar.** The fixed column on the left of the home page and the two error pages that have one ("Page not found", "You need permission"), headed "Probase" and linking to the collections listed in the code-level configuration. It does not appear on collection, problem, test, add-problem, invite or login pages. It is not filtered by permission: it lists the same collections to everyone.

**Answer box.** The field a numeric answer is typed into: the **integer box** ("Enter an integer"; an optional leading minus sign and digits, leading zeros removed) or the **three-digit box** ("Enter a number (0-999)"; up to three digits). The collection's answer format picks it: AIME collections get the three-digit box, every other format the integer box in a timed attempt. The add-problem form uses the same boxes for Integer and AIME collections.

**Back link.** The underlined "‹ Back to {collection name}" link at the top left of the problem page, the add-problem page and the test page. On the problem page it keeps the collection page's search and filters.

**Card.** A problem's white rounded box on the collection page (problem ID, title, statement or padlock, heart, lightbulbs), or a problem's box on the test page ("PROBLEM {n}" and the statement or padlock). The whole card is a link to the problem page.

**Chip.** A rounded pill under a problem's title on the problem page: one colored subject chip (a link to the collection page filtered to that subject) and one gray chip per test the problem belongs to.

**Filters.** The collection page's search box, subject checkboxes, "Archived" switch and "Unsolved only" switch. They narrow the problem list, live only in the URL, and are applied by the server on every change; nothing is saved and there is no Apply button. [Search and filters](collection/search-and-filters.md) owns them.

**Heart.** The like control: a heart icon and a like count, rose-colored when the user has liked the problem and gray otherwise.

**Lightbulbs.** Five lightbulb icons, the first _difficulty_ of them lit amber.

**Click-to-edit.** The inline editor Probase uses for the problem's title, statement and answer, a solution's text, and the text fields of the add-problem form. It shows the text (with math rendered) until clicked, then becomes a text box; a single-line one saves on Enter or blur, a multi-line one on Shift/Ctrl/Cmd+Enter or a "Save changes" button. [Click-to-edit](foundations/click-to-edit.md) owns its behavior.

**Spoilers.** The answer and solution on an unlocked problem page, hidden behind a "Show spoilers" button until clicked. Hiding them is a courtesy to readers, not access control.

**Add Solution.** The prompt "No solutions yet. You could be the first!" with an "Add Solution" button, shown inside the spoilers of an unlocked problem that has no solution, to any user with an [author](#people-and-access) in the collection. The button opens a multi-line box ("Write your solution here!") with "Submit" and "Discard"; Shift/Ctrl/Cmd+Enter submits, Escape clears and closes it, and blur does nothing. See [solutions](problem-page/solutions.md).

**Discussion.** The "Discussion" section at the bottom of an unlocked problem page: a comment box, a "Post comment" button, and the comments posted so far.

**Toast.** A red notice in the bottom-right corner of the window that shows an action's error message. Toasts stack, each has a close button, and each disappears on its own after 8 seconds. Probase has no success toasts.

**Spinner.** A small rotating ring shown inside a submit button while its form is pending.

**Math.** Text between `$...$`, `$$...$$`, `\(...\)` or `\[...\]` in a statement, answer, solution or comment, rendered as typeset mathematics. [Math rendering](cross-cutting/math-rendering.md) owns the rules.

## Other users and other tabs

**Other user.** Any signed-in user other than the one the document follows. Probase shows other users' work only when a page is loaded or refreshed; nothing is pushed live.

**Freshness.** Whether what a page shows matches what the server holds. A page is fresh when it loads or refreshes and grows stale as other tabs and other users make changes. [Freshness](cross-cutting/freshness.md) says what refreshes when.
