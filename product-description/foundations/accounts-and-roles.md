# Accounts and roles

## Summary

Probase has one kind of account, a Google account, and one kind of access, a [permission](../glossary.md#people-and-access) that gives a user a [role](../glossary.md#people-and-access) in one collection. On top of the role, two things change what a user sees and may do: whether they are an [author](../glossary.md#people-and-access) of the problem in front of them, and, in a collection that [requires testsolving](../glossary.md#testsolving), their [testsolver type](../glossary.md#testsolving). This document owns those rules: how a user signs in and stays signed in, what each role allows, how authorship is gained, how testsolver types are set, and in what order Probase checks all of it. Every other document links here instead of restating who may do what.

None of this is managed in the interface. Users get a permission by accepting an [invite](../entry/invites.md); roles are otherwise created and changed in the database. There is no member list, no role editor, no profile page, and no sign-out control.

## Signing in

Signing in always goes through Google. The [login page](../entry/sign-in.md) and the signed-out [invite page](../entry/invites.md) each have a "Log in with Google" button; clicking it sends the browser to Google, which shows its account chooser and then its consent screen (every time, not only the first time, because Probase asks Google for consent on each sign-in). When Google sends the user back, Probase creates the user on first sign-in, or recognizes them by their Google account or by their email address, and returns them to the page they started from.

What Probase keeps from Google, as of the moment of sign-in:

- **The email address.** Used only to check an invite's email domain.
- **The name.** The Google full name, or the given and family names joined with a space when Google sends no full name. Used for the user's author name (the first time they need one), for comments and for the leaderboard.

Changing one's Google name or email later has no effect until the next sign-in, and an author name, once created, never changes.

> Technical note: accounts are linked by email address (`allowDangerousEmailAccountLinking`), so a user row created ahead of time with someone's email (as the demo seed does) is taken over by whoever signs in to Google with that address.

## The session

A successful sign-in gives the browser a session valid for 30 days. Nothing in Probase's pages renews it: the pages read the session but never ask for a fresh one, so it ends 30 days after sign-in however often the user visits. When it ends, the user is signed out without warning. A page already open keeps working until the user acts or navigates: every [action](../glossary.md#interaction) then answers "Not signed in", and every collection page redirects to the login page, which returns them to where they were once they sign in again.

There is no way to sign out from the interface. The authentication library's own sign-out page exists at `/api/auth/signout`, but nothing links to it. Signing in with a different Google account means signing out there (or clearing the site's cookies) first; the one place Probase offers a different account is the invite page's wrong-domain state, whose button starts a fresh Google sign-in.

## Roles

A user has at most one permission per collection, so at most one role. The role decides what the user may do there:

| The user may...                                           | Admin          | TeamMember              | ViewOnly | SubmitOnly                                     | No permission |
| --------------------------------------------------------- | -------------- | ----------------------- | -------- | ---------------------------------------------- | ------------- |
| Open the collection page, problem pages and test pages    | Yes            | Yes                     | Yes      | No                                             | No            |
| See the "Add Problem" button and use the add-problem form | Yes            | Yes                     | No       | Yes, by typing the form's URL                  | No            |
| Edit a problem's title, statement and answer; archive it  | Every problem  | Problems they authored  | No       | Problems they authored (but cannot open them)  | No            |
| Add the first solution to a problem                       | Yes¹           | Yes¹                    | No       | No                                             | No            |
| Edit a solution                                           | Every solution | Solutions they authored | No       | Solutions they authored (but cannot open them) | No            |
| Comment                                                   | Yes            | Yes                     | Yes      | Allowed, but cannot open a problem page        | No            |
| Like a problem                                            | Yes            | Yes                     | Yes      | No                                             | No            |
| Start, submit and give up a timed attempt                 | Yes            | Yes                     | Yes      | No                                             | No            |
| See "Written by" in a collection that hides authors       | Yes            | No                      | No       | No                                             | No            |
| See every row of a leaderboard                            | Every problem  | Problems they authored  | No       | No                                             | No            |
| Skip an invite to the collection ("Already Joined")       | Yes            | Yes                     | No       | No                                             | No            |

¹ Only once they have an author in the collection; see [authorship](#authorship).

The same rules in words:

- **Admin** can do everything in the collection and edit every problem and solution.
- **TeamMember** can read everything, add problems and solutions, comment, like and testsolve, and edit what they authored.
- **ViewOnly** can read, comment, like and testsolve. They cannot add or edit anything.
- **SubmitOnly** can add problems and nothing else. They cannot open the collection, so they never see the problems they submitted after submitting them; see [adding a problem](../collection/adding-a-problem.md).
- **No permission** (signed in but not a member) and **signed out** can do nothing in the collection.

"[Can view](../glossary.md#people-and-access)" means Admin, TeamMember or ViewOnly. "Full member" means Admin or TeamMember, the two roles an invite will never lower.

## Authorship

An author is a per-collection pen name. A user gets one in a collection the first time they open that collection's add-problem page (on a production build, as soon as they view the collection page; see [saving and feedback](saving-and-feedback.md#edge-cases)). It is named after their Google name at that moment and is never renamed. A user normally has one author per collection; if the database gives them more, the first is used for everything they submit.

A problem submitted through the form has exactly one author, the submitter's. A solution added through the page has exactly one author, the adder's. Problems and solutions created in the database may have several authors, or authors with no user at all ("Default Author" in the demo data), which nobody but an Admin can edit.

Authorship matters in four places:

1. **Editing.** A TeamMember or SubmitOnly member can edit a problem, or a solution, only if their author is one of its authors.
2. **Adding a solution.** The "Add Solution" button appears only to users who have an author in the collection, and the solution is attributed to that author. An Admin or TeamMember without an author sees no way to add a solution.
3. **Testsolving.** A user who can edit a problem never needs to testsolve it: authors and Admins see their own problems unlocked.
4. **The leaderboard.** A user who can edit a problem sees every row of its leaderboard.

Being an author is not shown anywhere as such. "Written by {author}" shows the problem's first author, and only when the collection shows authors or the viewer is an Admin.

## Testsolver types

In a collection that requires testsolving, every member who can view it has to choose how they testsolve before they can open anything in it. The first visit to any page of such a collection that runs the full access check sends them to the [chooser](../testsolving/choosing-a-testsolver-type.md), which offers:

- **Serious.** Problems are hidden until the member starts a [timed attempt](../testsolving/timed-attempt.md). Their [serious period](../glossary.md#testsolving) is dated from the collection's creation, so every problem is hidden at first.
- **Casual.** Every problem is visible at once. There are no timed attempts.

Two collections, `topsoj` and `mgci`, skip the choice for new members: accepting an invite to them makes the member Serious from the collection's creation. See [per-collection settings](../cross-cutting/per-collection-settings.md).

Admins must choose too, even though, being able to edit every problem, nothing is ever hidden from them.

The type can be changed by opening the chooser's address again; nothing links to it after the first choice, although the chooser itself says "You can always switch to Casual later". A change applies to pages loaded afterwards. In a collection that does not require testsolving, the type is ignored.

## How access is checked

Every page under `/c/{cid}` except the add-problem page and the test page runs the same checks, in this order, and stops at the first that fails:

1. **The collection exists**, or the user sees "Page not found". This is checked before sign-in, so a signed-out visitor can tell a real collection's address from a mistyped one.
2. **The user is signed in**, or they are sent to the login page, which brings them back afterwards.
3. **The user can view the collection**, or they are sent to "You need permission".
4. **The user has chosen a testsolver type**, if the collection requires testsolving, or they are sent to the chooser.

The chooser runs the first three checks and skips the fourth, so that it can be shown to someone who has not chosen.

The add-problem page checks sign-in before the collection, and then checks "may add problems" instead of "can view", so that SubmitOnly members can use it. The test page checks that the test exists, then sign-in, then "can view", and skips the testsolver-type check. See [navigation](navigation.md).

Actions check again on the server, in their own order: signed in, the record exists, the role (and authorship where it matters) allows it. A page never shows a control the user cannot use, but an action is always checked as if it might have been.

## Access that changes while a page is open

A page shows what the user's access allowed when it was built. If the role is changed or removed, or the testsolver type changes, in the database or by accepting an invite in another tab, the open page keeps showing the old controls. The next action is checked against the new access and may be refused with a permission [toast](../glossary.md#interface); the next page load shows the new access. The same holds when the session ends: the page stays, actions answer "Not signed in", and the next load goes to the login page.

## Open questions and verification

- That the session is never renewed while the user browses was read from the configuration (session tokens, no middleware, no client session provider). Confirm by inspecting the session cookie's expiry before and after using the site a day later. If it is renewed, the glossary's [session](../glossary.md#people-and-access) entry must change.
- The Google consent screen appearing on every sign-in follows from the sign-in request Probase sends; not confirmed by hand (Google's screens are out of scope for the local pass).
- Checking the collection's existence before sign-in reveals which collection addresses exist to anyone. Whether that matters is a product call.
- A ViewOnly or SubmitOnly member who accepts an invite with a lower role is lowered to it (only Admins and TeamMembers are protected). A ViewOnly member accepting a SubmitOnly invite loses the ability to view the collection. This may be worth treating as a bug.
- The chooser promises "You can always switch to Casual later", but nothing links back to it. Whether switching should be offered in the interface is a product call.
- An Admin in a collection that requires testsolving must choose a type that has no effect on them. Whether that is intended is a product call.

Verified against Probase commit `c38ff56`
