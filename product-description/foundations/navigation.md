# Navigation

## Summary

This document owns how a user moves around Probase: every address the site answers, the checks each page runs before showing itself and where each failed check sends the user, what the collection page keeps in its URL, the links that carry that state along, the problem page's Previous and Next, and how links load their destinations (including the eager prefetching that makes some pages appear instantly and slightly stale). Feature documents say where their own links go and link here for the rest.

Probase is a set of separate pages rather than one app with a persistent frame. There is no header, no logo link, no breadcrumb and no account menu. A [sidebar](../glossary.md#interface) appears on the home page and two of the error pages only. Getting from one place to another is done with the links each page offers and with the browser's own back button.

## The pages

| Address                           | Page                                                    | Who gets it                                                     |
| --------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| `/`                               | [Home page](../entry/home-page.md)                      | Everyone                                                        |
| `/login?callbackUrl={path}`       | [Login page](../entry/sign-in.md)                       | Signed-out visitors; the signed-in are sent on to `{path}`      |
| `/invite/{code}`                  | [Invite page](../entry/invites.md)                      | Everyone with a real code                                       |
| `/need-permission`                | ["You need permission"](../entry/error-pages.md)        | Everyone                                                        |
| `/c/{cid}`                        | [Collection page](../collection/problem-list.md)        | Members who can view                                            |
| `/c/{cid}/p/{pid}`                | [Problem page](../problem-page/problem-page.md)         | Members who can view                                            |
| `/c/{cid}/add-problem`            | [Add-problem page](../collection/adding-a-problem.md)   | Members who may add problems                                    |
| `/c/{cid}/choose-testsolver-type` | [Chooser](../testsolving/choosing-a-testsolver-type.md) | Members who can view, in a collection that requires testsolving |
| `/c/{cid}/t/{name-slug}-{testId}` | [Test page](../collection/tests.md)                     | Members who can view the test's collection                      |
| anything else                     | ["Page not found"](../entry/error-pages.md)             | Everyone                                                        |

Addresses are case-sensitive: `/c/demo/p/a1` is not `/c/demo/p/A1` and shows "Page not found".

The authentication library also answers under `/api/auth/` (the Google sign-in hand-off, its callback, its own sign-in, sign-out and error pages). Nothing in Probase links to those pages; users pass through them only on the way to and from Google.

## What each page checks, in order

Each page runs its checks on the server before anything is shown, stopping at the first that fails. [Accounts and roles](accounts-and-roles.md#how-access-is-checked) explains the rules; this is where each failure lands.

| Page             | Checks, in order                                                                                                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Collection page  | Collection exists (else "Page not found") → signed in (else login, returning to `/c/{cid}`) → can view (else "You need permission") → type chosen if required (else chooser) → page number not past the end (else the last page) |
| Problem page     | The collection page's first four checks, with login returning to `/c/{cid}/p/{pid}` → problem exists (else "Page not found")                                                                                                     |
| Add-problem page | Signed in (else login, returning to the form) → collection exists → may add problems (else "You need permission")                                                                                                                |
| Chooser          | Collection exists → signed in (else login, returning to **the collection page**) → can view → collection requires testsolving (else the collection page)                                                                         |
| Test page        | Test exists (else "Page not found") → signed in (else login, returning to the test) → can view the test's collection (else "You need permission")                                                                                |
| Invite page      | Invite exists (else "Page not found"); then the page itself shows one of several states (see [invites](../entry/invites.md))                                                                                                     |
| Login page       | Signed in (then straight on to the return address)                                                                                                                                                                               |

Two consequences users can notice:

- The login redirect drops the collection page's search and filters and the problem page's carried filters: after signing in, the user returns to the bare address.
- The test page does not check that the collection in its address is the test's own collection, and does not send members who have not chosen a testsolver type to the chooser.

## The login round trip

When a page needs a signed-in user, it sends the browser to `/login?callbackUrl={path}`, with the path encoded. The login page accepts only a path on this site (it must start with a single `/`; anything else, including `//elsewhere.example`, is replaced by `/`) and passes it to the Google button. After Google, the user lands on that path. A signed-in user who opens the login page is sent straight to the path. See [sign-in](../entry/sign-in.md).

## The collection page's URL

The collection page keeps its search box, subject filters, Archived switch, Unsolved-only switch and page number in its query string, so a filtered view can be bookmarked, shared and reloaded:

| Parameter      | Meaning                                                        | Written as                                                      |
| -------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| `subject`      | Show only these subjects                                       | Their lower-case letters in the order a, c, g, n: `?subject=ag` |
| `search`       | Show only problems whose title or statement contains this text | URL-encoded text                                                |
| `archived`     | Show archived problems instead of unarchived ones              | `archived=true`; absent otherwise                               |
| `unsolvedOnly` | Hide problems the user has started testsolving                 | `unsolvedOnly=true`; absent otherwise                           |
| `page`         | Which page of 20                                               | Absent for page 1                                               |

Reading the URL is forgiving: subject letters are matched case-insensitively anywhere in the value (so `?subject=algebra` means Algebra and Geometry, because it contains an a and a g), only the exact text `true` turns a switch on, and a repeated parameter is ignored. See [search and filters](../collection/search-and-filters.md) and [pagination](../collection/pagination.md).

**How the URL changes.** Typing in the search box and flipping a filter _replace_ the current history entry, without scrolling, so the back button skips over every intermediate filter. Clicking a page number _adds_ an entry.

**Where the query string travels.** A problem card links to the problem page with the collection page's query string attached. The problem page ignores it except to pass it on: its back link returns to the collection page with the same search, filters and page, and Previous and Next carry it along. The subject chip on the problem page links to the collection page filtered to that one subject, dropping everything else. The add-problem page's and test page's back links go to the bare collection page.

## Back links

The problem page, the add-problem page and the test page have a "‹ Back to {collection name}" link at the top left. The collection page has no link back to anywhere: there is no way from a collection page to the home page or another collection except the browser's back button or typing an address.

## Previous and Next

The problem page ends with "← Previous" and "Next →". They do arithmetic on the [problem ID](data-model.md#the-problem-id) rather than looking at the list:

- **Previous** goes from `A3` to `A2`. On a problem numbered 1 it is shown grayed out and does nothing.
- **Next** goes from `A3` to `A4`. It is always enabled; on the last problem of a subject it leads to "Page not found".
- Both stay within the subject letter, include archived problems, and ignore the carried search and filters (which they pass on untouched). They are not the collection page's order, which is newest first across all subjects.

## How links load

Every Probase link loads its destination without a full browser reload: the page is fetched from the server and swapped in, the window scrolls to the top (except for filter changes), and client-side state on the old page (typed text, open editors, the spoilers' open state) is gone. Moving between two problems counts as leaving the page: the next problem starts fresh.

**Eager prefetching.** On a production build, most Probase links load their destination in the background as soon as they scroll into view, so clicking them feels instant: problem cards, test cards, the sidebar's collection links, back links, the subject and test chips, the "Add Problem" button, the collection page's numbered page links, and the buttons on the error and invite pages. A prefetched page is reused for up to five minutes, unless a successful action or a refresh in the meantime clears the browser's cache. So a page opened through one of these links can show data up to five minutes old; reloading shows the current data. Previous and Next, and the pagination's "Previous" and "Next", are not prefetched this way and are always fetched when clicked. The development server does not prefetch at all.

Prefetching runs the destination page on the server as if the user had opened it. For every page but one that has no effect the user could notice; the exception is the add-problem page, which creates the user's author when it loads (see [saving and feedback](saving-and-feedback.md#edge-cases)).

**Back and forward.** The browser's back and forward buttons show the page from the browser's cache of recent pages where it has one, without asking the server again, so a page returned to with Back can show what it showed before, not what the server holds now.

## Cancel and interrupt

Navigation is the interrupt in most other documents; this table covers a navigation that is itself interrupted.

| Event                               | Before editing                                                  | While editing (a link has been clicked and the page is loading)                                                                          |
| ----------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Escape or Discard                   | No effect.                                                      | No effect: Escape does not stop an in-app navigation.                                                                                    |
| Browser back or forward             | Moves through history as described above.                       | The pending navigation is abandoned in favor of the history entry.                                                                       |
| Reload                              | Rebuilds the current page, with the current URL's query string. | Reloads whichever address the browser shows at that moment.                                                                              |
| Tab or window closed                | Nothing recorded.                                               | Nothing recorded.                                                                                                                        |
| A link inside the app followed      | Loads the destination.                                          | The newer click wins.                                                                                                                    |
| Network lost mid-request            | No effect until a link is followed.                             | The destination does not arrive; the browser falls back to a full page load of the address, which fails with the browser's offline page. |
| Request fails or returns an error   | No effect.                                                      | A failure while building the page shows "Something went wrong"; a missing record shows "Page not found".                                 |
| Session ends                        | No effect on the open page.                                     | The destination's checks send the user to the login page.                                                                                |
| Access changes                      | No effect on the open page.                                     | The destination's checks use the new access ("You need permission", the chooser, or a different view).                                   |
| Same record changed in another tab  | Not shown.                                                      | Shown if the destination was fetched now; possibly not, if it was prefetched up to five minutes earlier.                                 |
| Same record changed by another user | As another tab.                                                 | As another tab.                                                                                                                          |
| Autofill writes into the field      | Not applicable.                                                 | Not applicable.                                                                                                                          |
| The window loses focus              | No effect.                                                      | No effect.                                                                                                                               |
| The testsolve time limit passes     | No effect on navigation.                                        | No effect on navigation; the problem page's own view reflects it when it arrives.                                                        |

## Open questions and verification

- The five-minute reuse of eagerly prefetched pages follows from the framework's defaults for prefetched links and was not observed. Confirm on a production build by changing a problem in a second browser and opening it from a card that was already on screen.
- The fallback to a full page load when a navigation fails offline is the framework's behavior, not Probase's; not confirmed.
- Next leading to "Page not found" after the last problem of a subject, and Previous and Next never leaving the subject, are deliberate consequences of ID arithmetic; whether they should follow the list's order instead is a product call.
- There is no way from a collection page to the home page. Whether that is intended is a product call.
- Losing the search and filters across a login redirect was read from code (the redirect is built from the path alone).

Verified against Probase commit `c38ff56`
