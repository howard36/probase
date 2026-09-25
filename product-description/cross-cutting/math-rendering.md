# Math rendering

## Summary

Math rendering is how Probase turns LaTeX written between delimiters into typeset mathematics. It applies to a problem's statement, answer and solution, to comments, and, for users who [can edit](../glossary.md#people-and-access) the problem, to its title. Everything outside the delimiters is shown exactly as typed, with line breaks and spaces kept; nothing is interpreted as Markdown or HTML. Formulas are drawn by KaTeX (version 0.18) inside the page. A formula that cannot be drawn is shown in dark red instead, and never stops the rest of the page from showing. This document owns the rules: the delimiters, how the end of a formula is found, what a stray delimiter does, what can and cannot be drawn, and which text on which page is rendered. How text is edited belongs to [click-to-edit](../foundations/click-to-edit.md) and the feature documents.

## The simple case

An author opens the add-problem form and types this statement:

```
Find all real $x$ such that
$$x^2 - 5x + 6 = 0.$$
```

While the box is open it shows exactly those characters. When they click away, the field closes and shows "Find all real _x_ such that" with the _x_ in italic math type, and the equation below it, centered on a line of its own. After they submit, the problem page, the problem's card on the collection page and its card on any test page show the statement the same way. Readers never see the dollar signs.

If the author had typed `$x^$` by mistake, readers would see `x^` in dark red where the formula should be, and hovering it would show KaTeX's explanation.

## Writing math

### Delimiters

| Written as | Drawn as                                                           |
| ---------- | ------------------------------------------------------------------ |
| `$...$`    | Inline: part of the line of text                                   |
| `$$...$$`  | Display: centered on a line of its own, with space above and below |
| `\(...\)`  | Inline                                                             |
| `\[...\]`  | Display                                                            |

No other markers start math. In particular, a LaTeX environment such as `\begin{align}...\end{align}` written without delimiters is plain text.

### How the text is split into formulas

Probase reads the text from the start:

1. It looks for the first opening delimiter of any of the four kinds. Where `$$` and `$` both start at the same place, `$$` wins.
2. From there it looks for the closing delimiter of the same kind: `$` closes `$`, `$$` closes `$$`, `\)` closes `\(`, `\]` closes `\[`. While looking, it skips any character that follows a backslash, and it ignores closing delimiters inside `{...}` braces. So `$\$5$`, `$\{x\}$` and `$\text{a $b$ c}$` are each one formula.
3. If a closing delimiter is found, the formula between them is drawn and the search continues after it. Two formulas can touch: `$x$$y$` is _x_ followed by _y_.
4. If none is found, the opening delimiter and **everything after it** are shown exactly as typed. No later formula in the same text is drawn, whatever its delimiters.

### Text between formulas

Text outside the delimiters is shown literally. HTML tags (`<b>`), Markdown (`**bold**`, `# heading`, lists), and web addresses appear as typed; nothing becomes bold, a heading or a link. Every place that renders math keeps line breaks, blank lines, runs of spaces and leading spaces as typed, and wraps long lines at the edge of the column.

### Writing a dollar sign

There is no escape for a dollar sign in plain text. A backslash does not help: `\$5` shows the backslash, and its `$` still opens a formula. A dollar sign can be written in two ways:

- **Inside a formula**, as `\$`: `$\$5$` shows a dollar sign and 5 in math type, and `$\text{\$5}$` shows them in text type.
- **As the last dollar sign in the text.** A lone `$` with no other `$` anywhere after it is shown as typed, together with the rest of the text (see rule 4 above).

Anything else pairs the dollar sign with the next one. `It costs $5 and $10` shows "It costs " followed by "5and" in italic math type, then "10": both dollar signs vanish and the spaces between them are dropped, because spaces are ignored inside math.

## How formulas are drawn

KaTeX supports most of LaTeX's math: fractions, roots, sums and integrals, Greek letters, `\text{...}`, `\mathbb`, matrices, `cases`, `aligned`, colors, and more; its own documentation lists every command. Environments that LaTeX allows only in display math (such as `align`) work only between `$$` or `\[` delimiters.

Math is drawn in KaTeX's own fonts, about a fifth larger than the text around it. The fonts are served with Probase's pages; nothing is loaded from another site. Each formula is drawn on its own, so a macro defined in one formula (`\def`, `\newcommand`, `\gdef`) is unknown in the next one.

### When a formula cannot be drawn

| Problem                                                                                                                              | What the reader sees                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A syntax error: a missing argument (`x^`), an extra `}`, an environment that needs display math written inline                       | The formula's source, without its delimiters, in dark red. Hovering it shows KaTeX's message, for example "ParseError: KaTeX parse error: Expected group after '^' at position 2: x^̲". The text around it is shown normally. |
| An unknown command (`\foo`, or a macro defined in another formula)                                                                   | Only the command's name, in dark red; the rest of the formula is drawn.                                                                                                                                                      |
| A command KaTeX has switched off for safety: `\href`, `\url`, `\includegraphics`, `\htmlClass`, `\htmlId`, `\htmlStyle`, `\htmlData` | The command's name in dark red. Its arguments are not shown, and no link, image or styling is created.                                                                                                                       |
| An opening delimiter with no closing one                                                                                             | Not treated as an error: the delimiter and the rest of the text are shown as typed.                                                                                                                                          |

A mistake in one formula affects only that formula (or, for a missing closing delimiter, the rest of that one field). The server never checks math: a statement, answer, solution or comment with broken math is saved like any other, and the mistake shows only when the text is displayed.

## Where math is rendered

| Text                                                                                                                                                                 | Rendered?                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Statement: on problem cards, test cards, the problem page (unlocked and testsolving views), an editor's statement field, the add-problem form                        | Yes                                                                                         |
| Answer and solution: in the [spoilers](../problem-page/spoilers.md), in editors' fields, on the add-problem form (its answer field only in a ShortAnswer collection) | Yes                                                                                         |
| Comment text in the [discussion](../problem-page/discussion.md)                                                                                                      | Yes                                                                                         |
| Title, for a user who can edit the problem (its click-to-edit field) and on the add-problem form once its box is closed                                              | Yes                                                                                         |
| Title, for everyone else on the problem page, and on every problem card on the collection page                                                                       | No: shown as typed, dollar signs included. A card's title is also cut to one line with "…". |
| Test names (chips, the test page's heading), collection names (back links, invite page), "Written by {author}", commenters' names, leaderboard names                 | No                                                                                          |
| The wrong-answer line in a [timed attempt](../testsolving/timed-attempt.md) ("**{answer}** is incorrect!")                                                           | No; the answer box accepts only digits and a minus sign, so there is no math to render      |
| Any text box while it is being typed in: click-to-edit boxes, the comment box, the Add Solution box, the answer box                                                  | No: the source is shown                                                                     |
| Placeholders on the add-problem form                                                                                                                                 | No: shown as typed, as examples of the notation                                             |
| The browser tab's title                                                                                                                                              | Always "Probase"                                                                            |

A locked card or locked problem page shows no statement, so there is nothing to render there.

## Seeing the result while writing

Probase has no live preview. What the rendered text will look like is visible only once the text is shown rather than edited:

- **Add-problem form.** Closing a field (Enter in a single-line field, a click elsewhere) shows it rendered, before anything is sent. This is the only place a formula can be checked before it is stored. The placeholders show the notation: `$42$` in the short answer, `Given a triangle $ABC$ with circumcenter $O$ and circumcircle $\Gamma$ ...` in the statement, and `Since $O$ is the circumcenter, it lies on the perpendicular bisector of $BC$ ...` in the solution. The title's placeholder is "Short and catchy title".
- **Problem page fields.** A save is sent to the server at once, and the field shows the rendered result immediately ([click-to-edit](../foundations/click-to-edit.md)). A mistake is fixed by clicking the field and saving again.
- **Add Solution.** The box shows the source until "Submit"; after that the solution's author can correct it through the solution's editor ([solutions](../problem-page/solutions.md)).
- **Comments.** A comment is rendered only once posted, and comments cannot be edited, so broken math in a comment stays broken.

Math rendering itself has no interaction to cancel or interrupt, so this document has no cancel-and-interrupt table; the editors that produce the text have their own.

## Interactions with other systems

**Permissions.** Only the title depends on who is looking: rendered for users who can edit the problem, shown as typed to everyone else. Everything else renders the same for every role.

**Testsolving locks.** Locked cards and the locked view show no statement. The testsolving view renders the statement. A timed attempt compares answers as typed, never as rendered, and its answer box accepts only digits, so an answer stored as `$42$` can never be matched (see [the timed attempt](../testsolving/timed-attempt.md)).

**Per-collection settings.** No setting turns math off or changes the delimiters. The answer format decides whether an answer can contain math at all: in a ShortAnswer collection the answer is free text with the placeholder `$42$`, which invites dollar signs; Integer and AIME collections take digits only. See [per-collection settings](per-collection-settings.md).

**Validation and errors.** Nothing validates math. Broken math appears as red text on the page, never as a [toast](../glossary.md#interface).

**Unsaved changes.** Not involved; typed text belongs to the editors.

**Optimistic updates.** A problem-page click-to-edit save shows the new text rendered at once, before the server answers ([saving and feedback](../foundations/saving-and-feedback.md#optimistic-updates-and-rollback)).

**Freshness and other users.** Rendered text is as fresh as the page, and a refresh re-renders it, except in click-to-edit fields, which keep the text they were given. See [freshness](freshness.md).

**URL state.** None. The collection page's search, which lives in the URL, matches the title and statement as typed, not as rendered: searching `frac` finds statements that contain `\frac`, and searching for "Γ" does not find `\Gamma`.

**Math rendering.** This document.

**Offline.** Rendering happens in the page, so math already on screen stays. Nothing needs the network except loading the page.

**Keyboard and accessibility.** Each formula carries a hidden MathML copy for screen readers, and the drawn symbols are hidden from them, so a screen reader reads the mathematics rather than the glyphs. The red error message is only a hover tooltip, so it is out of reach of keyboard and touch users. See [keyboard and accessibility](keyboard-and-accessibility.md).

**Narrow screens.** A display formula wider than its column scrolls sideways within its own line. An inline formula wraps only after a relation or operator (`=`, `+`, `<`); one with no such place never wraps and can stick out past the edge of its column. See [narrow screens](narrow-screens.md).

**Side effects.** None.

## Edge cases

- A stray `$` pairs with the next dollar sign, even one meant to open a later formula, so every later formula in the text shifts by one: in `costs $5, so $x$ is`, "5,so" is drawn as math, _x_ is plain text, and `$ is` is shown as typed.
- A stray `$$` or `\(` (one with no matching close) turns off every later formula in the same text. `$$x$`, with one closing dollar sign missing, shows `$$x$` and the rest of the text as typed.
- An unmatched `{` inside a formula makes Probase skip the closing delimiter until a later `}` closes the brace, so the text in between is swallowed into the formula, which then usually shows in red: `$\frac{1$ and $x}$` is one broken formula.
- `$ $` draws nothing; the two dollar signs and the space disappear.
- Display math in a title or an answer is centered on its own line inside that field.
- A title with math reads differently to its editors (rendered) and to everyone else (source), and always shows its source on the collection page's card.
- Colors are allowed (`\color{red}`, `\textcolor`), so a formula can deliberately look like an error.
- Math is drawn in fonts that load with the page; KaTeX tells the browser to wait for them, so on a slow first load formulas can be blank for a moment.

## Open questions and verification

- The splitting rules and the error behavior were read from `components/katex.tsx` and checked by running that code and KaTeX's renderer with Probase's options outside the browser; they were not observed in the running app.
- Titles are rendered for users who can edit them and shown as source to everyone else, including on every problem card. This inconsistency looks like a bug rather than a design.
- There is no way to write a dollar sign in plain text, since a backslash does not escape it. Whether to support `\$` outside math is a product question.
- Each piece of text and each formula is keyed by its own content, so a field containing the same text twice (the ", " in `$x$, $y$, $z$`) or the same formula twice gives the page duplicate keys. React warns about this in development and, when such a field's text later changes in place (a refresh bringing an edited statement), may drop or repeat pieces until the page is reloaded. Not observed; this may be worth treating as a bug.
- The code has a branch meant to keep `\begin{...}` environments whole, but it can never apply, because every formula starts with a delimiter. Whether environments written without delimiters should render (as in KaTeX's own auto-render) is a product question.
- Whether blank lines around a `$$...$$` formula add extra vertical space, given that whitespace is kept, was not confirmed.
- What selecting and copying rendered math puts on the clipboard (probably the symbols and the hidden source run together) was not confirmed.
- The error tooltip uses KaTeX's own wording, which is written for LaTeX users.

Verified against Probase commit `c38ff56`
