# Per-collection settings

## Summary

Per-collection settings are the options that make one collection behave differently from another. There are two kinds. [Collection settings](../glossary.md#collection-settings) are stored with the collection in the database: the answer format, whether the answer, solution and difficulty are required on the add-problem form, whether the collection shows authors, whether it requires testsolving, and one legacy flag that nothing reads. [Code-level configuration](../glossary.md#collection-settings) names particular collections by their slug in the code: which collections the sidebar lists, which make every new member a Serious testsolver, and which have their own difficulty labels. Neither kind can be seen or changed anywhere in the interface, by anyone, Admins included: the database settings are chosen when the collection is created in the database and changed only there, and the code-level configuration changes only with a new version of Probase. This document owns the full list: every setting, its default, what it changes and which document describes that change, the demo collection's settings, and the combinations of settings that break things.

## The simple case

A collection created with the database defaults behaves like this for its members:

- The add-problem form has a free-text "ANSWER" field (placeholder `$42$`) and a Difficulty menu labeled "Very easy" to "Very hard", and the answer, the solution and the difficulty must all be filled before the browser lets the form be submitted.
- There is no testsolving: no chooser, no padlocks, no timed attempts, no leaderboard, and no "Unsolved only" switch. Every member who can view the collection reads every problem.
- "Written by {author}" appears on problem pages for everyone or only for Admins, depending on how "shows authors" was set when the collection was created (it has no default).
- The collection is not in the sidebar unless the code lists it, so members reach it from a link or by typing its address.

## The settings

| Setting                  | Kind       | Values                              | Default                                     |
| ------------------------ | ---------- | ----------------------------------- | ------------------------------------------- |
| Answer format            | Database   | ShortAnswer, Integer, AIME, Proof   | ShortAnswer                                 |
| Require answer           | Database   | On, off                             | On                                          |
| Require solution         | Database   | On, off                             | On                                          |
| Require difficulty       | Database   | On, off                             | On                                          |
| Shows authors            | Database   | On, off                             | None: chosen when the collection is created |
| Requires testsolving     | Database   | On, off                             | Off                                         |
| Short answer (legacy)    | Database   | On, off                             | On                                          |
| Sidebar list             | Code-level | `cmimc`, `otis-mock-aime`, `topsoj` | Not listed                                  |
| Forced Serious           | Code-level | `topsoj`, `mgci`                    | Not forced                                  |
| Custom difficulty labels | Code-level | `otis-mock-aime`                    | "Very easy" to "Very hard"                  |

## What each setting changes

| Setting                  | What it changes                                                                                                                                                                           | Described in                                                                                                                                                                                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Answer format            | The add-problem form's answer field (free text, integer box, three-digit box, or none) and the timed attempt's answer box (three-digit box for AIME, integer box for every other format). | [Adding a problem](../collection/adding-a-problem.md), [the timed attempt](../testsolving/timed-attempt.md#modifiers)                                                                                                                                                                                 |
| Require answer           | Whether the form's answer field must be filled.                                                                                                                                           | [Adding a problem](../collection/adding-a-problem.md)                                                                                                                                                                                                                                                 |
| Require solution         | Whether the form's solution field must be filled.                                                                                                                                         | [Adding a problem](../collection/adding-a-problem.md)                                                                                                                                                                                                                                                 |
| Require difficulty       | Whether the form's Difficulty menu must be chosen.                                                                                                                                        | [Adding a problem](../collection/adding-a-problem.md)                                                                                                                                                                                                                                                 |
| Shows authors            | Whether "Written by {first author}" appears under the statement of an unlocked problem page for members other than Admins.                                                                | [The problem page](../problem-page/problem-page.md#arrive)                                                                                                                                                                                                                                            |
| Requires testsolving     | The chooser and the redirect to it; locks on the problem page, collection page cards and test page cards; timed attempts; the leaderboard; the "Unsolved only" switch.                    | [Choosing a testsolver type](../testsolving/choosing-a-testsolver-type.md), [the locked problem](../testsolving/locked-problem.md), [the timed attempt](../testsolving/timed-attempt.md), [the leaderboard](../testsolving/leaderboard.md), [search and filters](../collection/search-and-filters.md) |
| Short answer (legacy)    | Nothing.                                                                                                                                                                                  | This document                                                                                                                                                                                                                                                                                         |
| Sidebar list             | The three collection links in the sidebar of the home page, "Page not found" and "You need permission".                                                                                   | [The home page](../entry/home-page.md)                                                                                                                                                                                                                                                                |
| Forced Serious           | New members who join by invite are Serious testsolvers at once and never see the chooser.                                                                                                 | [Invites](../entry/invites.md#submit), [choosing a testsolver type](../testsolving/choosing-a-testsolver-type.md)                                                                                                                                                                                     |
| Custom difficulty labels | The names of the five levels in the add-problem form's Difficulty menu.                                                                                                                   | [Adding a problem](../collection/adding-a-problem.md)                                                                                                                                                                                                                                                 |

Nothing else varies by collection. The collection page's cards, search and filters, the discussion, likes, archiving, click-to-edit and the error pages behave the same everywhere, apart from the locks and the "Unsolved only" switch that requiring testsolving brings.

### Answer format

- **ShortAnswer** (the default). The form's answer is a single-line [click-to-edit](../foundations/click-to-edit.md) field that takes any text, math included, with the placeholder `$42$`. A timed attempt uses the integer box.
- **Integer.** The form's answer is a box with the placeholder "Enter an integer" that accepts only an optional leading minus sign and digits, and removes leading zeros as the user types. A timed attempt uses the same box, so every answer entered through the form can be typed in an attempt.
- **AIME.** The form's answer is a box with the placeholder "Enter a number (0-999)" that accepts at most three digits and removes leading zeros. A timed attempt uses the same box.
- **Proof.** The form has no answer field, and every problem submitted through it is stored with an [empty answer](../foundations/data-model.md#the-answers-three-states). The problem page therefore shows an "ANSWER" heading with nothing under it inside the spoilers, and offers users who can edit the problem an open, empty answer editor there. A timed attempt uses the integer box.

The format governs only those two boxes. The answer as read and the problem page's answer editor are the same in every format: the editor takes free text, so an author can change an Integer or AIME answer to anything, including text the timed attempt's box cannot type. See [editing the problem](../problem-page/editing-the-problem.md).

### Required answer, solution and difficulty

Each of the three marks one field of the add-problem form as required, so the browser refuses to submit the form while it is empty and points to it with its own required-field bubble. The server does not check them: a problem it receives without an answer is stored with an empty answer, without a solution it has none, and without a difficulty it has none. "Require answer" does nothing in a Proof collection, which has no answer field.

When a field is not required, leaving it empty has these results on the problem page: an empty answer shows the answer editor open for its authors and an empty "ANSWER" for everyone else; no solution means "Add Solution" for members with an author; no difficulty means no lightbulbs. The Difficulty menu starts blank, but once a level has been picked the blank choice cannot be picked again, so a difficulty that is not required can be skipped only by never touching the menu.

### Shows authors

When on, "Written by {first author}" appears under the statement on the unlocked problem page for every member. When off, only Admins see it. It has no default: whoever creates the collection in the database must choose. It changes nothing else. The collection page and the test page never name authors, and commenters' and testsolvers' names are shown in every collection (see [the discussion](../problem-page/discussion.md) and [the leaderboard](../testsolving/leaderboard.md)).

### Requires testsolving

When on:

- Every member who can view the collection, Admins included, is sent to the [chooser](../testsolving/choosing-a-testsolver-type.md) by the collection page and the problem page until they choose Serious or Casual. The add-problem page and the test page do not send them there.
- The chooser can be opened; when the setting is off its address sends the user to the collection page.
- For Serious testsolvers, problems they cannot edit are [locked](../testsolving/locked-problem.md) until they start a [timed attempt](../testsolving/timed-attempt.md), on the problem page and on the cards of the collection page and the test page.
- Unlocked problem pages show the [leaderboard](../testsolving/leaderboard.md).
- Serious testsolvers get an "Unsolved only" switch on the collection page ([search and filters](../collection/search-and-filters.md)).

When off, none of this happens, testsolver types are ignored, and attempts already recorded are kept but shown nowhere.

### The legacy short-answer flag

Collections also carry a "short answer" flag, on by default, from before the answer format existed. Nothing in Probase reads it; the answer format replaced it.

### The sidebar list

The sidebar lists "CMIMC" (`/c/cmimc`), "OTIS Mock AIME" (`/c/otis-mock-aime`) and "TopsOJ" (`/c/topsoj`), in that order, with those labels rather than the collections' own names. It shows the same three links to everyone, signed in or not, member or not. A listed collection that does not exist leads to "Page not found"; on a local instance built from the demo data that is all three. The demo collection and `mgci` are not listed. See [the home page](../entry/home-page.md).

### Collections that force Serious testsolving

In `topsoj` and `mgci`, a user who joins by accepting an [invite](../entry/invites.md) is made a Serious testsolver, with their [serious period](../glossary.md#testsolving) dated from the collection's creation. If the collection requires testsolving, every problem they cannot edit is therefore locked from their first visit, and they are never sent to the chooser. It applies whatever role the invite grants, although it changes nothing for an Admin (who can edit every problem) or a SubmitOnly member (who cannot open the collection).

It does not apply to anyone else:

- A member whose permission was created in the database, not by an invite, has no type and is sent to the chooser like anywhere else.
- A ViewOnly or SubmitOnly member who accepts a further invite keeps whatever type they had, including none.
- A forced member can still open the chooser's address and switch to Casual.

It does not depend on the collection requiring testsolving: in a collection that does not, the type is recorded and has no effect until the setting is turned on.

### Difficulty labels

The add-problem form's Difficulty menu names the five levels "Very easy", "Easy", "Medium", "Hard" and "Very hard". In `otis-mock-aime` they are "AIME 1-3", "AIME 4-6", "AIME 7-9", "AIME 10-12" and "AIME 13-15". Only the menu's wording changes: the stored difficulty is still 1 to 5, shown as that many lightbulbs, and a timed attempt's time limit is still 5 + 5 × difficulty minutes, so an "AIME 13-15" problem has 30 minutes.

## The demo collection

A local instance starts with one collection from the demo data:

| Setting              | Demo collection                                        |
| -------------------- | ------------------------------------------------------ |
| Name and slug        | "Probase Demo", `demo`                                 |
| Answer format        | ShortAnswer (default)                                  |
| Required fields      | Answer, solution and difficulty all required (default) |
| Shows authors        | Off                                                    |
| Requires testsolving | Off (default)                                          |
| Legacy flag          | On                                                     |
| Code-level           | Not in the sidebar, not forced, default labels         |

Its four problems, A1, N1, C1 and G1, are by "Default Author" (an author with no user), each with an answer and a solution, and each with difficulty 0, which shows no lightbulbs. The collection is reached by typing `/c/demo` or through the demo invite `/invite/demo`, a reusable Admin invite with no domain and no expiry from a pre-created user named Howard Halim, who is also the collection's Admin. So anyone who opens that invite on a local instance becomes an Admin of the demo collection.

Because every demo problem has difficulty 0, turning on "requires testsolving" for the demo collection makes all four problem pages fail for Serious testsolvers (see [below](#combinations-that-break-things)).

## Combinations that break things

- **Requires testsolving with the ShortAnswer format.** ShortAnswer is the default format. Its form takes the answer as free text, and its placeholder, `$42$`, suggests writing the answer as math. A timed attempt's integer box cannot type `$`, letters, spaces, fractions, decimals, a plus sign or leading zeros, so a problem whose answer contains any of them can never be solved; every attempt on it ends by giving up or running out of time, and its leaderboard lists everyone as unsolved. An author who follows the placeholder makes their problem unsolvable. The Integer and AIME formats do not have this problem, because the form and the attempt use the same box. See [the timed attempt](../testsolving/timed-attempt.md).
- **Requires testsolving without requiring a difficulty.** A problem submitted without a difficulty has no time limit. For every Serious testsolver who needs to testsolve it, its card shows a padlock, but its problem page fails with "Something went wrong" instead of showing the locked view, so it can be neither read nor testsolved. Only its authors, Admins and Casual testsolvers can open it. Problems created in the database with difficulty 0 behave the same. See [the problem page](../problem-page/problem-page.md#edge-cases).
- **Requires testsolving with the Proof format.** Every problem has an empty answer, and the timed attempt's box refuses to submit an empty answer, so no attempt can ever be solved. Attempts end by giving up or running out of time, under a time limit set by a difficulty that may not mean much for a proof.
- **Requires testsolving without requiring an answer.** A problem submitted without an answer cannot be solved until an author adds one; attempts made before that end unsolved.
- **Forced Serious in a collection that does not require testsolving.** Members who joined by invite are silently Serious. If the collection later starts requiring testsolving, they find every problem locked without having been asked, while members added in the database are sent to the chooser.
- **Integer or AIME with the problem page's answer editor.** The editor takes free text, so an author can save an answer (`$5$`, `1000`, `05`) that the collection's own answer box cannot type.

## When a setting changes

Settings are read each time a page is built, so a change in the database shows up on the next load or refresh of each page, and never on a page already open. The code-level configuration changes only when a new version of Probase is deployed.

| Setting changed                 | On pages already open                                                                         | On the next load                                                                                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Answer format                   | An open add-problem form keeps its old answer field; an open timed attempt keeps its old box. | The form and the box follow the new format. Existing answers are not converted.                                                                                                     |
| Required fields                 | An open form keeps its old required marks. The server accepts the form either way.            | The new marks.                                                                                                                                                                      |
| Shows authors                   | No change.                                                                                    | "Written by" follows the new setting.                                                                                                                                               |
| Requires testsolving turned on  | No change.                                                                                    | Members without a type are sent to the chooser; Serious members, including those forced Serious, see locks; leaderboards and the "Unsolved only" switch appear.                     |
| Requires testsolving turned off | A running timed attempt keeps counting, and Submit and Give Up still work.                    | No locks, no leaderboards, no "Unsolved only" switch; the chooser's address leads to the collection page. Recorded attempts and types are kept, and return if it is turned back on. |

The settings have no interaction of their own, so the cancel-and-interrupt checklist belongs to the feature documents each setting affects.

## Interactions with other systems

**Permissions.** No role can see or change a setting. Two settings treat Admins specially: Admins see "Written by" whatever "shows authors" says, and Admins must choose a testsolver type in a collection that requires testsolving even though nothing is ever locked for them. See [accounts and roles](../foundations/accounts-and-roles.md).

**Testsolving locks.** Only "requires testsolving" makes locking possible. Forced Serious decides who is locked from the start, the difficulty sets the time limit, and the answer format decides whether an attempt can be solved at all.

**Per-collection settings.** This document.

**Validation and errors.** The required fields and the answer boxes are enforced by the browser only; the server stores whatever it is sent. The settings' failures on the server side are the problem page's "Something went wrong" and the testsolving actions' "Problem difficulty should not be null" for a problem without a difficulty.

**Unsaved changes.** Not affected by any setting.

**Optimistic updates.** Not affected by any setting.

**Freshness and other users.** Settings are read when each page is built; see [When a setting changes](#when-a-setting-changes) and [freshness](freshness.md).

**URL state.** No setting appears in a URL. The collection page's `unsolvedOnly=true` still filters when typed into the address of a collection where the switch is not shown; see [search and filters](../collection/search-and-filters.md).

**Math rendering.** The ShortAnswer field renders math in the answer; the Integer and AIME boxes cannot hold any. See [math rendering](math-rendering.md).

**Offline.** Not affected by any setting.

**Keyboard and accessibility.** The Integer and AIME boxes silently refuse keystrokes that do not fit, with no message; see [keyboard and accessibility](keyboard-and-accessibility.md).

**Narrow screens.** Not affected by any setting.

**Side effects.** None. Settings change what pages show and which fields are required; they never send anything.

## Edge cases

- Code-level configuration is matched on the slug exactly: a collection called `topsoj-2` gets none of `topsoj`'s configuration, and renaming a collection's slug in the database takes its configuration away.
- The sidebar marks a listed collection as current on any address that begins with its path, so on "Page not found" at `/c/topsoj-2/...` the "TopsOJ" link is highlighted.
- A collection that hides authors still reveals them through the discussion: an author who comments on their own problem is named there.
- In a Proof collection, opening the spoilers as an author puts focus in an empty answer editor, and saving text there gives the problem an answer.
- A collection with "requires testsolving" off can still hold attempts from a time it was on; they reappear, with their results, if the setting is turned back on.
- The Difficulty labels come from the code and the answer format from the database, so nothing keeps `otis-mock-aime`'s AIME-style labels consistent with its answer format.
- Whether `topsoj` and `mgci` require testsolving is a database setting that cannot be read from the code; forcing Serious has a visible effect only if they do.

## Open questions and verification

- No test covers the answer format, the three required settings or "shows authors"; what each changes was read from the pages that read them.
- Requiring testsolving in a ShortAnswer collection (the default format) makes most answers unsolvable in a timed attempt. This may be worth treating as a bug rather than documenting: either the attempt should accept free text in ShortAnswer collections, or collections that require testsolving should use Integer or AIME.
- A problem without a difficulty breaks the problem page for Serious testsolvers in a collection that requires testsolving but not a difficulty. This looks like a bug; the two settings should probably not be allowed together.
- The Proof format stores an empty answer, so its problem pages show an empty "ANSWER" and offer an answer editor. Whether Proof problems should have no answer field at all (an absent answer) is a product call.
- The required settings are checked only by the browser. Whether the server should enforce them is a product call.
- Forced Serious applies only to members who join by invite, not to members added in the database, and a forced member can switch to Casual by the chooser's address. Whether either is intended is a product call.
- The sidebar lists collections by slug to every visitor, whether or not they exist or the visitor is a member. Whether it should follow the user's memberships (the code carries a note to that effect) is a product call.
- The demo data's `/invite/demo` makes anyone who opens it an Admin of the demo collection on a local instance. That is intended for local use; it would matter only if the demo data reached a shared database.

Verified against Probase commit `c38ff56`
