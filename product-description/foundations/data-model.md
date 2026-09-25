# Data model

## Summary

This document describes, in user terms, the things Probase stores: what each one is, what it holds, who can see it, how it comes into being, and how long it lasts. It owns the facts other documents rely on when they say "the problem's answer", "the problem ID", "an attempt" or "an invite": how problem IDs are assigned, the three states of an answer, what archiving does and does not do, what can be deleted (nothing, through the interface), and which records exist only because someone created them in the database. Words are defined in the [glossary](../glossary.md#records); this document adds the rules and the relationships.

## The shape of it

Everything lives inside a **collection**. A collection holds problems, the members who may use it, the authors who write for it, the tests that group its problems, and the invites that let people in. Nothing is shared between collections: the same user has a separate permission, a separate author and a separate testsolver type in each.

- A **collection** has many **problems**, one **permission** per member, the **authors** who write for it, **tests**, and **invites**.
- A **problem** has **solutions** (the first is shown), **comments**, at most one **like** per user, and at most one **testsolve attempt** per user.
- A **test** lists some of the collection's problems at numbered positions.

## Records

### Collection

Created in the database only. It has a display name (shown on back links and the invite page; the sidebar uses its own labels), a short slug (its _cid_) used in every URL under `/c/`, a creation time, and the [collection settings](../glossary.md#collection-settings). The creation time matters to users in one way: a Serious testsolver's [serious period](../glossary.md#testsolving) is dated from it. Nothing in the interface lists a user's collections; the sidebar lists three fixed ones (see [the home page](../entry/home-page.md)).

### Problem

Created through the [add-problem form](../collection/adding-a-problem.md) (or in the database). It holds:

| Field      | What the user sees                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Problem ID | Before the title everywhere, and in the problem page's URL. Assigned once, never changed.                                              |
| Title      | Required, never empty. Editable in place by those who [can edit](../glossary.md#people-and-access).                                    |
| Subject    | One of Algebra, Combinatorics, Geometry, Number Theory. Chosen once on the form; there is no way to change it afterwards.              |
| Statement  | Required, never empty. Editable in place.                                                                                              |
| Answer     | Absent, empty, or text; see [the answer's three states](#the-answers-three-states). Editable in place when not absent.                 |
| Difficulty | 1 to 5, or absent. Chosen once on the form; no way to change it afterwards. Sets the time limit of a timed attempt.                    |
| Authors    | Normally the submitter's author only.                                                                                                  |
| Submitter  | The user who submitted it. Not shown anywhere.                                                                                         |
| Created at | Not shown, but orders the collection page (newest first) and decides whether a Serious testsolver's serious period covers the problem. |
| Archived   | Off when created; toggled by the Archive switch.                                                                                       |

A problem also has a source and an "anonymous" flag, and a solution a summary; the interface neither sets nor shows them.

### The problem ID

A problem ID is the subject's letter followed by a number: `A` for Algebra, `C` for Combinatorics, `G` for Geometry, `N` for Number Theory. Each subject is numbered separately within the collection, starting at 1.

A new problem's number is one more than the number of the _most recently created_ problem whose ID starts with the same letter, not one more than the highest number. In a collection filled only through the form the two are the same, so IDs run `A1`, `A2`, `A3` without gaps. They can diverge only when problems were created in the database with other IDs.

IDs are unique within a collection. Two people submitting problems in the same subject at the same moment can both be given the same next ID; the second submission then fails with the generic error and must be submitted again.

The problem page's Previous and Next links do arithmetic on the ID (`A3` goes to `A2` and `A4`) rather than looking up neighbors, so they stay within the subject and can lead to IDs that do not exist; see [navigation](navigation.md#previous-and-next).

### The answer's three states

- **Absent.** The problem has no answer at all. The problem page offers no answer and no answer editor, and a timed attempt can never be solved. Only problems created in the database can be in this state.
- **Empty.** The answer is an empty string. This is how "no answer yet, add one later" is stored: the form stores an empty answer when the collection does not require one, or when its answer format has no answer field. The problem page shows the answer editor open and empty to users who can edit, and an empty "ANSWER" to everyone else.
- **Text.** Anything else. It is shown with math rendered. A [timed attempt](../testsolving/timed-attempt.md) compares a submitted answer with it character for character, so `$42$` and `42` are different answers.

Once an answer has text, the interface cannot empty it again; [click-to-edit](click-to-edit.md) never saves an empty box.

### Solution

A written solution, attributed to authors. The form creates one when its solution field is filled; the problem page's "Add Solution" creates one when the problem has none. A problem can have several in the database, but every page shows only the first, and "Add Solution" is offered only while there are none, so the interface creates at most one per problem.

### Author

A pen name in one collection, usually tied to a user; see [authorship](accounts-and-roles.md#authorship). Created automatically, never renamed, never shown except as "Written by {author}".

### Comment

Text, the user who posted it, and when. Shown in the [discussion](../problem-page/discussion.md) under the poster's Google name. Never edited or deleted through the interface.

### Like

A user's mark on a problem, at most one per user per problem. Submitting a problem likes it for the submitter, so every problem submitted through the form starts with one like.

### Test

A name and an ordered list of problems from one collection, each at a numbered position. Created in the database only. A problem can belong to several tests and shows one chip per test on its page.

### Testsolve attempt

One user's timed try at one problem: when it started, how many answers were submitted, when (if ever) it was solved, and whether the user gave up. At most one per user per problem, so every problem can be testsolved once per user and never retried. Attempts are never deleted. An attempt's state, together with the time limit, decides the problem page's [view](../glossary.md#testsolving):

| Attempt                                    | View for a user who needs to testsolve |
| ------------------------------------------ | -------------------------------------- |
| None                                       | Locked                                 |
| Started, not solved, not given up, in time | Testsolving                            |
| Solved, given up, or past the time limit   | Unlocked                               |

Attempts by users who do not need to testsolve can exist too (a Casual testsolver cannot start one through the interface, but someone who changes type from Serious to Casual keeps theirs). All attempts on a problem appear on its [leaderboard](../testsolving/leaderboard.md), whoever made them.

### Permission

A user's role and testsolver type in one collection; see [accounts and roles](accounts-and-roles.md). Created by accepting an invite or in the database; changed by accepting another invite (never lowering a full member) or by the chooser (type only).

### Invite

A code, the collection it admits to, the role it grants, and optionally an email domain, a one-time flag and an expiry time. It also names the user who created it ("{inviter} invited you!"). Created in the database or by an operator script; see [invites](../entry/invites.md).

### User

Created on first Google sign-in. Holds the Google name, email and picture as of that sign-in. The picture is not shown anywhere.

## What is shared and what is private

Within a collection, everything is shared among those who can view it, with four exceptions:

1. **Locked problems.** A Serious testsolver sees only the title, chips, likes and difficulty of a problem they have not testsolved. Its statement, answer, solutions, comments and leaderboard are not sent to their browser. While testsolving, they see the statement but none of the rest.
2. **Authors' names.** "Written by" is shown only if the collection shows authors, or to Admins. Commenters' and testsolvers' names are always shown.
3. **The leaderboard.** Users who cannot edit the problem see at most the top five solvers plus their own row.
4. **Likes.** The count is shown to everyone; who liked is never shown.

Across collections, nothing is shared. A problem, an author or a test belongs to exactly one collection.

## What can be deleted

Nothing, through the interface. Problems can be archived; comments, solutions, likes (other than by unliking), attempts, tests, invites, authors, permissions and users can only be removed in the database. Deleting a collection in the database deletes everything in it.

## Open questions and verification

- The rule that a new problem ID follows the most recently created problem in the subject, not the highest number, was read from code and the add-problem tests. It matters only when IDs were created by hand.
- The collision between two simultaneous submissions in one subject is documented in the repository's own notes and not handled; the second submitter sees the generic error. This may be worth treating as a bug.
- There is no way in the interface to change a problem's subject or difficulty after submission, to remove an answer, or to delete anything. Whether those should exist is a product call.
- The source, anonymous flag and solution summary are stored but unused by the interface.

Verified against Probase commit `c38ff56`
