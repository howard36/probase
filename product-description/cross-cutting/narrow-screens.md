# Narrow screens

## Summary

Probase has no separate phone layout. Each page is laid out for a desktop window and adjusts at four window widths (640, 768, 1024 and 1280 pixels), mostly by narrowing its column, shrinking its text and stacking blocks that sit side by side on a wider window. Phones get each page at their own width, and pinch zoom works. This document owns what changes on a narrow window, page by page, what can end up wider than the window, and how the site behaves under a finger and with an on-screen keyboard. Browser zoom counts as a narrower window: at 200% zoom, a window 1280 pixels wide lays out like one 640 pixels wide.

Most pages work on a phone. The exceptions are the three pages with the [sidebar](../glossary.md#interface), which never collapses and takes 10 rem (160 pixels) of a phone's width; on one of them, "You need permission", the text also runs off the right edge of any window narrower than 768 pixels.

## The simple case

A member opens Probase on a phone 375 pixels wide. The home page shows the sidebar down the left, 160 pixels wide, and the welcome text squeezed into the 183 pixels left beside it. They tap a collection link. The collection page has no sidebar: "Add Problem" and the search box fill the width, one above the other, followed by the four subject checkboxes and the switches, so the first [card](../glossary.md#interface) starts about 300 pixels down. Each card shows its title on one line, cut short with an ellipsis if it is long, the whole statement, and a bottom row with the [heart](../glossary.md#interface) at the left and the lightbulbs at the right.

They tap a card. The problem page's column is 311 pixels wide with 16-pixel text. The heart and lightbulbs keep their place at the right of the title, which leaves the title and its chips about 160 pixels. Everything below follows in one column, as on a desktop, only narrower.

## Widths

Probase uses Tailwind's standard breakpoints, unchanged. Widths are CSS pixels; most phones held upright are 360 to 430 pixels wide.

| Window width     | What changes                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Under 640 pixels | The narrowest layout. The sidebar is 10 rem wide. On the collection page "Add Problem" and the search box stack, and each card carries its heart and lightbulbs in a row under the statement. Margins and text are at their smallest.                                                                                                                                                                                  |
| From 640 pixels  | The sidebar widens to 16 rem and the home page's margins grow to 6 rem. "Add Problem" and the search box share a row. Cards move the heart and lightbulbs up into the title line. The problem page's and add-problem page's column widens from 28 to 32 rem, the test page's from 32 to 36 rem, and their text grows from 16 to 18 pixels. The login and invite pages center a 36-rem column with more space above it. |
| From 768 pixels  | The problem and add-problem column widens to 36 rem with 20-pixel text and a 24-pixel title; the test page's widens to 40 rem. Cards get more padding and larger text. The chooser's two cards sit side by side. "You need permission" fits for the first time.                                                                                                                                                        |
| From 1024 pixels | Only the "Leaderboard" and "Discussion" headings grow, from 18 to 24 pixels.                                                                                                                                                                                                                                                                                                                                           |
| From 1280 pixels | The collection page becomes three columns: the list in the middle, at most 48 rem wide; the controls in a column on the right that stays in view while the list scrolls; an empty column on the left to balance it.                                                                                                                                                                                                    |

## Page by page

Sizes for a 375-pixel phone are computed from the page's styles; those marked "measured" were also measured in a local pass.

### Home page, "Page not found", "You need permission"

The sidebar is fixed to the left edge at full height at every width and cannot be hidden or collapsed: 10 rem (160 pixels) under 640 pixels, 16 rem (256 pixels) from 640. The page's content is pushed right to make room for it. Under 640 pixels its "Probase" heading is smaller and left-aligned, and "OTIS Mock AIME" may wrap onto two lines ([the home page](../entry/home-page.md)).

- **Home page.** Under 640 pixels, 16-pixel margins (32 at the top) and 16-pixel text; from 640, 96-pixel margins and 18-pixel text. On a 375-pixel phone the text column is 183 pixels wide (measured). Because the sidebar and the margins both grow at 640 pixels, the column is 447 pixels wide on a window 639 pixels wide and 192 pixels on one 640 pixels wide (measured).
- **"Page not found".** The box is 32 rem wide, capped at the space beside the sidebar, with 2 rem of padding on each side, so on a 375-pixel phone the heading and text wrap in a 151-pixel column (measured).
- **"You need permission".** The box is 32 rem (512 pixels) wide with no cap and no margin. On any window narrower than 768 pixels it runs past the right edge and the page scrolls sideways; on a 375-pixel phone it is 297 pixels too wide (measured). Scrolling sideways slides the text under the fixed sidebar ([error pages](../entry/error-pages.md)).

### Collection page

No sidebar. The margins are 16 pixels under 640 pixels, 32 from 640, and 48 at the sides (96 at the top and bottom) from 1280.

- **Controls.** Under 1280 pixels, "Add Problem", the search box and the filters come first, above the list, at full width. Under 640 "Add Problem" (for roles that may add problems) and the search box are stacked, each the full width; from 640, "Add Problem" is at most 14 rem wide beside the search box. The subject checkboxes and the switches are always one vertical list under them. On a 375-pixel phone the first card starts 308 pixels down for a TeamMember (measured). From 1280 pixels the controls move to the right-hand column, "Add Problem" above the search box, and stay in view as the list scrolls ([search and filters](../collection/search-and-filters.md)).
- **Cards.** Full width: 343 pixels on a 375-pixel phone (measured). The title is always a single line, cut with an ellipsis; under 640 pixels it has the card's whole width, and from 640 it shares the line with the lightbulbs and the heart. The statement is shown in full at every width. Under 640 pixels the heart and lightbulbs sit in their own row at the bottom, heart at the left; from 640 they sit at the right end of the title line, lightbulbs first. Padding is 24 pixels (32 from 768), the title is 20 pixels (24 from 768), the statement 16 pixels (18 from 768), and the icons 18 pixels (20 from 640, 24 from 768) ([the collection page](../collection/problem-list.md)).
- **Page links.** One centered row that never wraps. With "Previous", five page numbers and "Next" it is about 390 pixels wide, more than the 343 pixels a 375-pixel phone leaves for it ([pagination](../collection/pagination.md)).

### Problem page and add-problem page

Both use the same centered column: 28 rem (448 pixels) under 640 pixels, 32 rem from 640, 36 rem from 768, never wider than the window less 2 rem of margin on each side. On a 375-pixel phone it is 311 pixels (measured). Body text is 16 pixels (18 from 640, 20 from 768).

- **Header.** The back link is followed by 32 pixels of space (64 from 640). The title is 20 pixels (24 from 768). The heart and lightbulbs keep their own column at the right of the title at every width, so on a phone the title and the chips share what is left: 159 pixels for a problem with lightbulbs (measured). Chips wrap onto further lines, but each keeps its own name on one line ([the problem page](../problem-page/problem-page.md)).
- **Body.** "Show spoilers" and "Add Solution" keep their fixed 11-rem width; "Save changes" and "Discard" fit side by side. The comment box and the comments take the column's width. In the locked view, "Testsolve to view" is 18 pixels (20 and 24 on wider windows) and "Start testsolving" spans the column. In a timed attempt the answer box spans the column and "Submit" and "Give Up" stay side by side. "Leaderboard" and "Discussion" are 18 pixels (24 from 1024).
- **Add-problem form.** The title field's text is 24 pixels (30 from 640); the menus and boxes span the column. On arrival the cursor is in "SOLUTION" but the page stays at the top, so on a 375 × 667 phone the box holding the cursor starts at the bottom edge of the screen (measured) and typing before tapping anywhere goes into a box the user can barely see ([adding a problem](../collection/adding-a-problem.md)).

### Test page

The column is 32 rem under 640 pixels, 36 rem from 640 and 40 rem from 768, never wider than the window less 2 rem of margin on each side: 311 pixels on a 375-pixel phone. The test's name is 30 pixels (36 from 640) with a further 2 rem of padding on each side. Each card keeps 2 rem of padding, so a statement gets 247 pixels on a phone. Text is 16 pixels (18 from 640, 20 from 768) ([the test page](../collection/tests.md)).

### Login page, invite page, chooser, "Something went wrong"

No sidebar, and 2 rem of margin at every width.

- **Login and invite pages.** Full width under 640 pixels (311 pixels of text on a 375-pixel phone), a centered 36-rem column from 640; the space above the heading grows from 48 to 96 pixels. "Log in with Google" always spans the column ([sign-in](../entry/sign-in.md), [invites](../entry/invites.md)).
- **Chooser.** The two cards are stacked under 768 pixels (measured on a phone) and side by side from 768, in a column at most 800 pixels wide ([choosing a testsolver type](../testsolving/choosing-a-testsolver-type.md)).
- **"Something went wrong".** A 32-rem box, capped at the window, with 2 rem of padding.

### Toasts

A [toast](../glossary.md#interface) is 20 rem wide, or the window's width less 3 rem if that is narrower, 1.5 rem from the right and bottom edges ([saving and feedback](../foundations/saving-and-feedback.md#toasts)). On a 375-pixel phone each toast is 327 pixels wide and covers the bottom of the screen for its 8 seconds, which at the end of a problem page is where "Previous" and "Next" are. Several toasts stack upwards and cover more.

## Content wider than the window

Ordinary text in statements, answers, solutions and comments wraps at the column's edge, breaking even long words and addresses, so it cannot make the page wider. Card titles are cut with an ellipsis instead. These can be wider than the window:

| What                                          | When                                           | What the user sees                                                                                                                                                                                                                  |
| --------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "You need permission"                         | Any window under 768 pixels                    | The text runs off the right edge; the page scrolls sideways.                                                                                                                                                                        |
| The leaderboard                               | A long name in a narrow column                 | Rows never wrap, so the table grows past the column and the page scrolls sideways ([the leaderboard](../testsolving/leaderboard.md)).                                                                                               |
| A test chip, or a very long word in the title | A long test name or word on a phone            | Neither can be broken to fit beside the heart: a chip keeps its name on one line, and the title area will not shrink below its longest word. The title area widens and pushes the heart and lightbulbs to, or past, the right edge. |
| The page links                                | Five page numbers and both arrows, on a phone  | The row is wider than the window and centered, so it spills past both edges; the part past the left edge cannot be scrolled to.                                                                                                     |
| A display formula                             | Wider than its column                          | It scrolls sideways within its own line; the page does not ([math rendering](math-rendering.md)).                                                                                                                                   |
| An inline formula                             | Long, with no relation or operator to break at | It cannot wrap and sticks out past the column's edge.                                                                                                                                                                               |

## Touch

- **Taps work everywhere.** Every control responds to a tap, including the ones that are clickable boxes rather than buttons: the heart, click-to-edit fields and the chooser's cards.
- **A card's heart** sits inside the card's link. A tap on the heart likes the problem; a tap just beside it opens the problem. Under 640 pixels it is at the bottom left of the card ([the heart](../problem-page/likes.md)).
- **Hover-only information** cannot be reached by touch: a comment's full date and time, and the error message of a formula that cannot be drawn, are hover tooltips. The hover colors (the heart darkening, a test card turning white and lifting) are decoration only; some phones keep them after a tap until the next tap elsewhere.
- **Small targets.** The subject checkboxes are 16-pixel squares, but their labels can be tapped too; the switches (36 × 20 pixels) and the "Archive" switch also take taps on their labels. A toast's × is a bare icon about 14 pixels high with no padding around it. Page numbers are 36-pixel squares.
- **Gestures.** Nothing responds to swipes, long presses or double taps beyond the browser's own scrolling and zooming.

### The on-screen keyboard

- **The search box** is a search field, so phone keyboards offer a Search or Go key. Pressing it is Enter: it reloads the collection page and clears the search and every filter ([keyboard and accessibility](keyboard-and-accessibility.md#in-text-boxes)).
- **The answer boxes** (in a timed attempt, and on the add-problem form in an Integer or AIME collection) are ordinary text fields, so the phone shows its letter keyboard, not a number pad; letters are refused as they are typed. The Go key submits, as Enter does.
- **Multi-line boxes** cannot use Shift/Ctrl/Cmd+Enter on most phone keyboards, so the return key only starts a new line. On the problem page, "Save changes" and the Add Solution "Submit" are the way to save; on the add-problem form a field closes when the user taps elsewhere.
- **The comment box** uses 14-pixel text. iOS Safari zooms the page in when a field with text smaller than 16 pixels is focused, so tapping into the comment box zooms the page, and it stays zoomed until the user pinches out. Every other field uses 16 pixels or more.
- **Fields that take focus by themselves** (a click-to-edit box after a tap, the Add Solution box, an empty answer's box when the spoilers open, "SOLUTION" when the add-problem form arrives) may or may not bring up the phone's keyboard; see open questions.

## Roles and settings

Role, authorship, testsolver type and the problem's state decide which controls a page shows ("Add Problem", "Unsolved only", the editors and their buttons, the "Archive" switch, the leaderboard), not how they are laid out: each follows the rules above for its page. The collection's settings change nothing here, except that the leaderboard, with its overflow, appears only in a collection that [requires testsolving](../glossary.md#testsolving).

## Edge cases

- Each card holds two hearts, one for windows under 640 pixels and one for wider windows, and shows one at a time. They keep separate counts and colors: after a like on one, turning a phone from portrait to landscape (or widening a window) across 640 pixels shows the other, still as it was when the page loaded, until the page is reloaded or left ([the heart](../problem-page/likes.md)).
- The home page and "Page not found" have a narrower text column on a window exactly 640 pixels wide than on one 639 pixels wide, because the sidebar and the margins grow at the same point.
- When a page scrolls sideways ("You need permission", a wide leaderboard), the fixed sidebar stays where it is and the content slides beneath it.
- On a phone a long card title shows only its first few words; the full title is on the problem page.
- The problem page keeps 2 rem of margin on each side on a phone, so its column is 64 pixels narrower than the screen.
- "Show spoilers" does not stretch to the column's width on a phone; it keeps its 11 rem.

## Open questions and verification

- Measured in a local pass (headless Chromium, production build, at 375 × 667 and at widths of 639, 640, 767, 768, 1279 and 1280 pixels): the home page's column widths, "Page not found" at 151 pixels, "You need permission" 297 pixels too wide on a phone and fitting from 768, the collection page's stacked controls and card layout with the second heart shown in the bottom row, the problem page's 311-pixel column and 159-pixel title area, the add-problem page arriving at the top with the cursor in "SOLUTION" at the bottom edge, the chooser's stacked cards, and the parts of the page-link row. Everything else is computed from the styles.
- "You need permission" overflowing every window narrower than 768 pixels looks like a bug: its box lacks the width cap that "Page not found" has.
- A sidebar that takes 43% of a phone's width and cannot be hidden may be worth treating as a bug.
- The add-problem page arriving with the cursor in a box at the very bottom of a phone's screen may be worth treating as a bug.
- The two hearts per card keeping separate state was read from code and not tried by rotating a device.
- The page-link row's width on a phone is added up from measured parts (a 107-pixel "Previous", 36-pixel numbers, a 78-pixel "Next", 4-pixel gaps); a full row of five numbers and both arrows was not seen on a phone.
- The overflow from a long test chip, a very long word in the problem's title and a long inline formula was read from the styles, not tried.
- Whether "Submit" and "Give Up" fit side by side on a 320- to 375-pixel phone without their labels wrapping was not measured; each button keeps room for an invisible spinner on both sides of its label.
- iOS Safari zooming into the comment box, the Search key clearing the filters, and whether the phone's keyboard opens for fields that the page focuses by itself were read from code and platform behavior, not tried on a phone.

Verified against Probase commit `c38ff56`
