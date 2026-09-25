// Scripted verification pass. Load the fixtures first (fixtures.cjs), then run from the
// repository root: NODE_PATH="$(npm root -g)" npx dotenv -e {env file} -- node product-description/verification/scripts/pass.mjs
// Results go to the file named by VERIFY_RESULTS (default: verification-results.json in the current directory).
import { launch, contextAs, trackActions, BASE, sql } from "./harness.mjs";
import { writeFileSync } from "node:fs";
const out = {};
const browser = await launch();
async function check(key, fn) {
  try {
    const [ok, note] = await fn();
    out[key] = { result: ok ? "pass" : "fail", note: note ?? "" };
  } catch (e) {
    out[key] = {
      result: "blocked",
      note: String(e.message).split("\n")[0].slice(0, 160),
    };
  }
  console.log(key.padEnd(34), out[key].result, out[key].note);
}
async function page(role, opts) {
  const ctx = await contextAs(browser, role, opts);
  const p = await ctx.newPage();
  p._ctx = ctx;
  return p;
}
const delay = (p, ms) =>
  p.route("**/*", async (route) => {
    const r = route.request();
    if (r.method() === "POST" && r.headers()["next-action"])
      await new Promise((res) => setTimeout(res, ms));
    await route.continue();
  });
const toasts = (p) => p.getByRole("alert").allInnerTexts();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- entry ----------
await check("home.sidebar-links", async () => {
  const p = await page(null);
  await p.goto(BASE + "/");
  const links = await p.locator('[aria-label="Sidenav"] nav a').allInnerTexts();
  await p._ctx.close();
  return [
    JSON.stringify(links) ===
      JSON.stringify(["CMIMC", "OTIS Mock AIME", "TopsOJ"]),
    JSON.stringify(links),
  ];
});
await check("home.no-signin-link", async () => {
  const p = await page(null);
  await p.goto(BASE + "/");
  const n = await p.locator('a[href*="login"]').count();
  await p._ctx.close();
  return [n === 0, `login links: ${n}`];
});
await check("signin.redirect-callback", async () => {
  const p = await page(null);
  await p.goto(BASE + "/c/demo/p/C1?search=x");
  const u = p.url();
  await p._ctx.close();
  return [u.endsWith("/login?callbackUrl=%2Fc%2Fdemo%2Fp%2FC1"), u];
});
await check("signin.signed-in-forwarded", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/login?callbackUrl=%2Fc%2Fdemo");
  const u = p.url();
  await p._ctx.close();
  return [u === BASE + "/c/demo", u];
});
await check("signin.unsafe-callback", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/login?callbackUrl=%2F%2Fevil.example");
  const u = p.url();
  await p._ctx.close();
  return [u === BASE + "/", u];
});
await check("signin.page-text", async () => {
  const p = await page(null);
  await p.goto(BASE + "/login");
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [
    t.includes("Log in to Probase") && t.includes("Log in with Google"),
    "",
  ];
});
await check("error.not-found", async () => {
  const p = await page("viewer");
  const r = await p.goto(BASE + "/c/demo/p/Z9");
  const t = await p.locator("body").innerText();
  const side = await p.locator('[aria-label="Sidenav"]').count();
  await p._ctx.close();
  return [
    r.status() === 404 && t.includes("Page not found") && side === 1,
    `status ${r.status()}, sidebar ${side}`,
  ];
});
await check("error.case-sensitive-pid", async () => {
  const p = await page("viewer");
  const r = await p.goto(BASE + "/c/demo/p/c1");
  await p._ctx.close();
  return [r.status() === 404, `status ${r.status()}`];
});
await check("error.need-permission", async () => {
  const p = await page("stranger");
  await p.goto(BASE + "/c/demo");
  const t = await p.locator("body").innerText();
  const links = await p
    .locator("main a, div.ml-40 a, div.sm\\:ml-64 a")
    .count();
  await p._ctx.close();
  return [
    p.url().endsWith("/need-permission") && t.includes("You need permission"),
    `url ${p.url()}`,
  ];
});
await check("error.500-no-difficulty", async () => {
  const p = await page("serious2");
  const r = await p.goto(BASE + "/c/ts/p/G1");
  const t = await p.locator("h1").allInnerTexts();
  await p.getByRole("button", { name: "Try again" }).click();
  await wait(1500);
  const t2 = await p.locator("h1").allInnerTexts();
  await p._ctx.close();
  return [
    r.status() === 500 &&
      t[0] === "Something went wrong" &&
      t2[0] === "Something went wrong",
    `status ${r.status()}, after Try again: ${t2}`,
  ];
});
await check("error.unknown-collection-before-signin", async () => {
  const p = await page(null);
  const r = await p.goto(BASE + "/c/nope");
  const u = p.url();
  await p._ctx.close();
  return [r.status() === 404 && !u.includes("login"), `status ${r.status()}`];
});

// ---------- invites ----------
await check("invite.signed-out", async () => {
  const p = await page(null);
  await p.goto(BASE + "/invite/join-demo");
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [
    t.includes("Ada Admin invited you!") &&
      t.includes("Log in to Probase to join") &&
      t.includes("Log in with Google"),
    "",
  ];
});
await check("invite.already-joined", async () => {
  const p = await page("member");
  await p.goto(BASE + "/invite/join-demo");
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [
    t.includes("Already Joined") && t.includes("Continue to Probase Demo"),
    "",
  ];
});
await check("invite.expired", async () => {
  const p = await page("stranger");
  await p.goto(BASE + "/invite/expired-demo");
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [t.includes("Invite Expired") && t.includes("contact Ada Admin"), ""];
});
await check("invite.wrong-domain", async () => {
  const p = await page("stranger");
  await p.goto(BASE + "/invite/edu-demo");
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [
    t.includes("@example.edu") &&
      t.includes("Currently logged in as stan@example.com"),
    "",
  ];
});
await check("invite.right-domain-accept", async () => {
  const p = await page("student");
  await p.goto(BASE + "/invite/edu-demo");
  await p.getByRole("button", { name: "Accept Invite" }).click();
  await p.waitForURL(/\/c\/demo$/, { timeout: 10000 });
  const role = sql(
    `select "accessLevel" from "Permission" where "userId"='u-student'`,
  );
  await p._ctx.close();
  return [role === "TeamMember", role];
});
await check("invite.once-expiring-bug", async () => {
  const p = await page("stranger");
  await p.goto(BASE + "/invite/once-expiring");
  await p.getByRole("button", { name: "Accept Invite" }).click();
  await wait(2500);
  const t = await toasts(p);
  const n = sql(
    `select count(*) from "Permission" where "userId"='u-stranger'`,
  );
  await p._ctx.close();
  return [
    t.includes("Invite has expired") && n === "0",
    `toasts ${JSON.stringify(t)}, permissions ${n}`,
  ];
});
await check("invite.one-time-used-up", async () => {
  const a = await page("stranger");
  await a.goto(BASE + "/invite/once-demo");
  await a.getByRole("button", { name: "Accept Invite" }).click();
  await a.waitForURL(/\/c\/demo/, { timeout: 10000 });
  await a._ctx.close();
  const b = await page("unchosen");
  await b.goto(BASE + "/invite/once-demo");
  const t = await b.locator("body").innerText();
  await b._ctx.close();
  return [
    t.includes("Invite Expired"),
    "second visitor sees: " + t.slice(0, 60).replace(/\n/g, " "),
  ];
});
await check("invite.lowers-viewonly", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/invite/submit-demo");
  await p.getByRole("button", { name: "Accept Invite" }).click();
  await wait(3000);
  const role = sql(
    `select "accessLevel" from "Permission" where "userId"='u-viewer' and "collectionId"=(select id from "Collection" where cid='demo')`,
  );
  const u = p.url();
  await p._ctx.close();
  sql(
    `update "Permission" set "accessLevel"='ViewOnly' where "userId"='u-viewer'`,
  );
  return [
    role === "SubmitOnly" && u.endsWith("/need-permission"),
    `role ${role}, landed ${u}`,
  ];
});
await check("invite.topsoj-forced-serious", async () => {
  const p = await page("casual");
  await p.goto(BASE + "/invite/join-topsoj");
  await p.getByRole("button", { name: "Accept Invite" }).click();
  await p.waitForURL(/\/c\/topsoj/, { timeout: 10000 });
  const t = sql(
    `select "testsolverType" from "Permission" where "userId"='u-casual' and "collectionId"=(select id from "Collection" where cid='topsoj')`,
  );
  const u = p.url();
  await p._ctx.close();
  return [t === "Serious" && u.endsWith("/c/topsoj"), `type ${t}, landed ${u}`];
});

// ---------- collection ----------
await check("list.prefetch-creates-author", async () => {
  const before = sql(`select count(*) from "Author" where "userId"='u-member'`);
  const p = await page("member");
  await p.goto(BASE + "/c/demo");
  await wait(3500);
  const after = sql(`select count(*) from "Author" where "userId"='u-member'`);
  await p._ctx.close();
  return [before === "0" && after === "1", `${before} -> ${after}`];
});
await check("list.newest-first-20", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo");
  const titles = await p.locator("ul > li h2").allInnerTexts();
  await p._ctx.close();
  return [
    titles.length === 20 && titles[0].startsWith("A24."),
    `${titles.length} cards, first ${titles[0]}`,
  ];
});
await check("list.archived-hidden", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo?page=2");
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [!t.includes("Archived algebra"), ""];
});
await check("list.no-heading", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo");
  const h1 = await p.locator("h1").count();
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [h1 === 0 && !t.includes("Probase Demo"), `h1 ${h1}`];
});
await check("list.card-heart-no-nav", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo");
  await p.locator("ul > li").first().locator("div.group").first().click();
  await wait(2000);
  const u = p.url();
  await p._ctx.close();
  return [u === BASE + "/c/demo", u];
});
await check("list.card-title-math-raw", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo?page=2");
  const t = await p.locator("h2", { hasText: "Math" }).innerText();
  await p._ctx.close();
  return [t.includes("$x^2$"), t];
});
await check("list.addproblem-hidden-viewonly", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo");
  const n = await p.getByText("Add Problem").count();
  await p._ctx.close();
  return [n === 0, ""];
});
await check("list.locked-cards-serious", async () => {
  const p = await page("serious");
  await p.goto(BASE + "/c/ts");
  const locks = await p.getByText("Testsolve to view").count();
  const html = await p.content();
  await p._ctx.close();
  return [
    locks >= 4 && !html.includes("What is the smallest prime"),
    `locks ${locks}`,
  ];
});
await check("filter.search-drops-chars", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo");
  const s = p.getByPlaceholder("Search");
  await s.click();
  await p.keyboard.type("filler", { delay: 20 });
  await wait(2500);
  const v = await s.inputValue();
  await p._ctx.close();
  return [v !== "filler", `box shows "${v}"`];
});
await check("filter.search-enter-clears", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo?subject=a&search=Filler");
  await p.getByPlaceholder("Search").press("Enter");
  await wait(2500);
  const u = p.url();
  await p._ctx.close();
  return [u === BASE + "/c/demo" || u === BASE + "/c/demo?", u];
});
await check("filter.subject-url", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo");
  await p.getByLabel("Number Theory").click();
  await p.waitForURL(/subject=n/, { timeout: 8000 });
  const titles = await p.locator("ul > li h2").allInnerTexts();
  await p._ctx.close();
  return [
    titles.length === 1 && titles[0].startsWith("N1."),
    JSON.stringify(titles),
  ];
});
await check("filter.archived-only", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo");
  await p.getByLabel("Archived").click();
  await p.waitForURL(/archived=true/, { timeout: 8000 });
  const titles = await p.locator("ul > li h2").allInnerTexts();
  await p._ctx.close();
  return [
    titles.length === 1 && titles[0].includes("Archived algebra"),
    JSON.stringify(titles),
  ];
});
await check("filter.search-matches-statement", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo?search=SUBSETS");
  const titles = await p.locator("ul > li h2").allInnerTexts();
  await p._ctx.close();
  return [
    titles.length === 1 && titles[0].startsWith("C1."),
    JSON.stringify(titles),
  ];
});
await check("filter.search-not-pid", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo?search=C1");
  const titles = await p.locator("ul > li h2").allInnerTexts();
  await p._ctx.close();
  return [titles.length === 0, JSON.stringify(titles)];
});
await check("filter.unsolved-switch-visibility", async () => {
  const a = await page("serious");
  await a.goto(BASE + "/c/ts");
  const na = await a.getByLabel("Unsolved only").count();
  await a._ctx.close();
  const b = await page("casual");
  await b.goto(BASE + "/c/ts");
  const nb = await b.getByLabel("Unsolved only").count();
  await b._ctx.close();
  return [na === 1 && nb === 0, `serious ${na}, casual ${nb}`];
});
await check("pagin.two-pages", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo");
  const nums = await p
    .locator('nav[aria-label="pagination"] li')
    .allInnerTexts();
  await p._ctx.close();
  return [
    nums.join("|").includes("1") && nums.join("|").includes("2"),
    JSON.stringify(nums),
  ];
});
await check("pagin.past-end-redirect", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo?page=9");
  const u = p.url();
  await p._ctx.close();
  return [u.endsWith("page=2"), u];
});
await check("pagin.page-zero-empty", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo?page=0");
  const n = await p.locator("ul > li h2").count();
  const u = p.url();
  await p._ctx.close();
  return [n === 0 && u.endsWith("page=0"), `${n} cards, ${u}`];
});
await check("add.focus-solution", async () => {
  const p = await page("member");
  await p.goto(BASE + "/c/demo/add-problem");
  await wait(800);
  const f = await p.evaluate(() =>
    document.activeElement?.getAttribute("name"),
  );
  await p._ctx.close();
  return [f === "solution", f];
});
await check("add.difficulty-labels-otis", async () => {
  const p = await page("admin");
  await p.goto(BASE + "/c/otis-mock-aime/add-problem");
  const opts = await p
    .locator('select[name="difficulty"] option')
    .allInnerTexts();
  await p._ctx.close();
  return [
    opts.includes("AIME 1-3") && opts.includes("AIME 13-15"),
    JSON.stringify(opts),
  ];
});
await check("add.enter-title-no-submit", async () => {
  const p = await page("member");
  const actions = trackActions(p);
  await p.goto(BASE + "/c/demo/add-problem");
  await p.locator('textarea[name="solution"]').fill("Solution text");
  await p.locator('select[name="subject"]').selectOption("Geometry");
  await p.locator('select[name="difficulty"]').selectOption("2");
  await p.locator('textarea[name="statement"]').fill("A statement");
  await p.locator('input[name="answer"]').fill("5");
  await p.locator('input[name="title"]').fill("Enter-submitted");
  await p.locator('input[name="title"]').press("Enter");
  await wait(2500);
  const u = p.url();
  await p._ctx.close();
  return [
    actions.length === 0 && u.endsWith("/add-problem"),
    `actions ${actions.length}, still on ${u}`,
  ];
});
await check("add.first-click-lost", async () => {
  const p = await page("member");
  const a = trackActions(p);
  await p.goto(BASE + "/c/demo/add-problem");
  await p.locator('input[name="title"]').fill("Enter-submitted");
  await p.locator('select[name="subject"]').selectOption("Geometry");
  await p.locator('select[name="difficulty"]').selectOption("2");
  await p.locator('textarea[name="statement"]').fill("A statement");
  await p.locator('input[name="answer"]').fill("5");
  await p.locator('textarea[name="solution"]').fill("Solution text");
  const b = await p.getByRole("button", { name: "Submit" }).boundingBox();
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await wait(1500);
  const first = a.length;
  await p.getByRole("button", { name: "Submit" }).click();
  await p.waitForURL(/\/p\/G\d+/, { timeout: 8000 }).catch(() => {});
  const u = p.url();
  await p._ctx.close();
  return [
    first === 0 && /\/c\/demo\/p\/G2$/.test(u),
    `after first click ${first} requests; after second, landed ${u}`,
  ];
});
await check("add.enter-integer-submits", async () => {
  const p = await page("writer");
  const a = trackActions(p);
  await p.goto(BASE + "/c/ts/add-problem");
  await p.locator('input[name="title"]').fill("Integer Enter");
  await p.locator('select[name="subject"]').selectOption("Geometry");
  await p.locator('select[name="difficulty"]').selectOption("1");
  await p.locator('textarea[name="statement"]').fill("Statement");
  await p.locator('textarea[name="solution"]').fill("Solution");
  await p.locator('input[name="answer"]').fill("5");
  await p.locator('input[name="answer"]').press("Enter");
  await p.waitForURL(/\/p\/G\d+/, { timeout: 8000 }).catch(() => {});
  const u = p.url();
  await p._ctx.close();
  return [
    a.length === 1 && /\/c\/ts\/p\/G2$/.test(u),
    `requests ${a.length}, landed ${u}`,
  ];
});
await check("add.submitonly-lands-need-permission", async () => {
  const p = await page("submitter");
  await p.goto(BASE + "/c/demo/add-problem");
  await p.locator('input[name="title"]').fill("From Sid");
  await p.locator('select[name="subject"]').selectOption("Combinatorics");
  await p.locator('select[name="difficulty"]').selectOption("1");
  await p.locator('textarea[name="statement"]').fill("Sid's statement");
  await p.locator('input[name="answer"]').fill("1");
  await p.locator('textarea[name="solution"]').fill("Sid's solution");
  await p.locator('select[name="subject"]').focus();
  await wait(300);
  await p.getByRole("button", { name: "Submit" }).click();
  await p.waitForURL(/need-permission/, { timeout: 10000 }).catch(() => {});
  const u = p.url();
  const stored = sql(`select pid from "Problem" where title='From Sid'`);
  await p._ctx.close();
  return [
    u.endsWith("/need-permission") && stored === "C2",
    `landed ${u}, stored ${stored}`,
  ];
});
await check("add.new-problem-liked", async () => {
  const n = sql(
    `select count(*) from "ProblemLike" l join "Problem" p on p.id=l."problemId" where p.title='Enter-submitted'`,
  );
  return [n === "1", n];
});
await check("test.slug-ignored-unchosen-sees-all", async () => {
  const p = await page("unchosen");
  const r = await p.goto(BASE + "/c/anything/t/whatever-1");
  const locks = await p.getByText("Testsolve to view").count();
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [
    r.status() === 200 &&
      locks === 0 &&
      t.includes("PROBLEM 1") &&
      t.includes("Mock Contest #1"),
    `status ${r.status()}, locks ${locks}`,
  ];
});
await check("test.serious-locks", async () => {
  const p = await page("serious");
  await p.goto(BASE + "/c/ts/t/mock-contest-1-1");
  const locks = await p.getByText("Testsolve to view").count();
  await p._ctx.close();
  return [locks === 3, `locks ${locks}`];
});
await check("test.bad-number", async () => {
  const p = await page("serious");
  const r = await p.goto(BASE + "/c/ts/t/abc");
  const h = await p.locator("h1").allInnerTexts();
  await p._ctx.close();
  return [
    r.status() === 500 && h[0] === "Something went wrong",
    `status ${r.status()}, h1 ${JSON.stringify(h)}`,
  ];
});

// ---------- problem page ----------
await check("page.prev-disabled-at-1", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/A1");
  const d = await p.getByRole("button", { name: "Previous" }).isDisabled();
  await p._ctx.close();
  return [d, ""];
});
await check("page.next-past-end-404", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/N1");
  await p.getByRole("link", { name: "Next" }).click();
  await wait(2000);
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [t.includes("Page not found"), p.url()];
});
await check("page.written-by-hidden-demo", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/C1");
  const n = await p.getByText("Written by").count();
  await p._ctx.close();
  const a = await page("admin");
  await a.goto(BASE + "/c/demo/p/C1");
  const na = await a.getByText("Written by").count();
  await a._ctx.close();
  return [n === 0 && na === 1, `viewer ${n}, admin ${na}`];
});
await check("page.title-static", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/C1");
  const t = await p.title();
  await p._ctx.close();
  return [t === "Probase", t];
});
await check("spoil.hidden-by-default", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/A1");
  const shown = await p.getByText("ANSWER").count();
  await p.getByRole("button", { name: "Show spoilers" }).click();
  const after = await p.getByText("ANSWER").count();
  const label = await p.getByRole("button", { name: "Hide spoilers" }).count();
  await p._ctx.close();
  return [shown === 0 && after === 1 && label === 1, ""];
});
await check("spoil.empty-answer-focused", async () => {
  const p = await page("writer");
  await p.goto(BASE + "/c/demo/p/G1");
  await p.getByRole("button", { name: "Show spoilers" }).click();
  await wait(300);
  const f = await p.evaluate(() =>
    document.activeElement?.getAttribute("name"),
  );
  await p._ctx.close();
  return [f === "answer", f];
});
await check("edit.escape-no-save", async () => {
  const p = await page("admin");
  const a = trackActions(p);
  await p.goto(BASE + "/c/demo/p/C1");
  await p.locator("h2").first().getByText("Wes's counting problem").click();
  await p.locator('input[name="title"]').fill("Escaped");
  await p.locator('input[name="title"]').press("Escape");
  await wait(1200);
  const t = sql(
    `select title from "Problem" p join "Collection" c on c.id=p."collectionId" where c.cid='demo' and pid='C1'`,
  );
  await p._ctx.close();
  return [
    a.length === 0 && t === "Wes's counting problem",
    `actions ${a.length}, stored "${t}"`,
  ];
});
await check("edit.enter-one-save", async () => {
  const p = await page("admin");
  const a = trackActions(p);
  await p.goto(BASE + "/c/demo/p/C1");
  await p.locator("h2").first().getByText("Wes's counting problem").click();
  await p.locator('input[name="title"]').fill("Wes's counting problem!");
  await p.locator('input[name="title"]').press("Enter");
  await wait(1500);
  const t = sql(
    `select title from "Problem" p join "Collection" c on c.id=p."collectionId" where c.cid='demo' and pid='C1'`,
  );
  await p._ctx.close();
  return [
    a.length === 1 && t === "Wes's counting problem!",
    `actions ${a.length}, stored "${t}"`,
  ];
});
await check("edit.blur-saves-unchanged", async () => {
  const p = await page("admin");
  const a = trackActions(p);
  await p.goto(BASE + "/c/demo/p/C1");
  await p.locator("h2").first().getByText("Wes's counting problem!").click();
  await p.locator("body").click({ position: { x: 5, y: 400 } });
  await wait(1500);
  await p._ctx.close();
  return [a.length === 1, `actions ${a.length}`];
});
await check("edit.statement-discard", async () => {
  const p = await page("admin");
  const a = trackActions(p);
  await p.goto(BASE + "/c/demo/p/C1");
  await p.getByText("How many subsets").click();
  await p.locator('textarea[name="statement"]').fill("Discard me");
  await p.getByRole("button", { name: "Discard" }).click();
  await wait(800);
  const shown = await p.getByText("How many subsets").count();
  await p._ctx.close();
  return [a.length === 0 && shown === 1, `actions ${a.length}`];
});
await check("edit.viewer-no-editor", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/C1");
  await p.locator("h2").first().click();
  const n = await p.locator('input[name="title"]').count();
  await p._ctx.close();
  return [n === 0, ""];
});
await check("sol.add-solution-flow", async () => {
  const p = await page("writer");
  await p.goto(BASE + "/c/demo/p/C1");
  await p.getByRole("button", { name: "Show spoilers" }).click();
  await p.getByRole("button", { name: "Add Solution" }).click();
  await p
    .getByPlaceholder("Write your solution here!")
    .fill("There are $2^3 = 8$.");
  await p.getByRole("button", { name: "Submit" }).click();
  await wait(2500);
  const n = await p.getByText("SOLUTION").count();
  const open = await p.getByRole("button", { name: "Hide spoilers" }).count();
  await p._ctx.close();
  return [n === 1 && open === 1, `solution label ${n}, spoilers open ${open}`];
});
await check("sol.double-submit", async () => {
  const p = await page("writer");
  await delay(p, 2000);
  await p.goto(BASE + "/c/demo/p/G1");
  await p.getByRole("button", { name: "Show spoilers" }).click();
  await p.locator('input[name="answer"]').fill("9");
  await p.locator('input[name="answer"]').press("Enter");
  await wait(2500);
  await p.getByRole("button", { name: "Add Solution" }).click();
  await p.getByPlaceholder("Write your solution here!").fill("Twice");
  await p.getByRole("button", { name: "Submit" }).dblclick();
  await wait(6000);
  const n = sql(
    `select count(*) from "Solution" s join "Problem" p on p.id=s."problemId" join "Collection" c on c.id=p."collectionId" where c.cid='demo' and p.pid='G1'`,
  );
  await p._ctx.close();
  return [n === "2", `solutions stored: ${n}`];
});
await check("sol.viewonly-with-author-refused", async () => {
  sql(
    `insert into "Author" ("displayName","userId","collectionId") values ('Vic Viewer','u-viewer',(select id from "Collection" where cid='demo'))`,
  );
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/A3");
  await p.getByRole("button", { name: "Show spoilers" }).click();
  await p.getByRole("button", { name: "Add Solution" }).click();
  await p.getByPlaceholder("Write your solution here!").fill("Vic's attempt");
  await p.getByRole("button", { name: "Submit" }).click();
  await wait(2500);
  const t = await toasts(p);
  await p._ctx.close();
  return [
    t.includes("You do not have permission to edit this collection"),
    JSON.stringify(t),
  ];
});
await check("disc.pending-disabled-once", async () => {
  const p = await page("viewer");
  const a = trackActions(p);
  await delay(p, 2500);
  await p.goto(BASE + "/c/demo/p/A1");
  await p.fill("#comment", "check comment");
  const b = p.getByRole("button", { name: "Post comment" });
  await b.click();
  await wait(300);
  const dis = await b.isDisabled();
  await b.click({ force: true }).catch(() => {});
  await wait(5000);
  const shown = await p.getByText("check comment").count();
  const box = await p.inputValue("#comment");
  await p._ctx.close();
  return [
    dis && a.length === 1 && shown === 1 && box === "",
    `disabled ${dis}, actions ${a.length}, shown ${shown}`,
  ];
});
await check("disc.empty-blocked", async () => {
  const p = await page("viewer");
  const a = trackActions(p);
  await p.goto(BASE + "/c/demo/p/A1");
  await p.getByRole("button", { name: "Post comment" }).click();
  await wait(800);
  await p._ctx.close();
  return [a.length === 0, `actions ${a.length}`];
});
await check("disc.whitespace-accepted", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/A1");
  await p.fill("#comment", "   ");
  await p.getByRole("button", { name: "Post comment" }).click();
  await wait(2500);
  const n = sql(`select count(*) from "Comment" where text='   '`);
  await p._ctx.close();
  return [n === "1", n];
});
await check("disc.hidden-while-locked", async () => {
  const p = await page("serious");
  await p.goto(BASE + "/c/ts/p/A2");
  const n = await p.getByText("Discussion").count();
  await p._ctx.close();
  return [n === 0, ""];
});
await check("like.optimistic-persists", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/A1");
  const h = p.locator("div.group").first();
  const before = await h.innerText();
  await h.click();
  const now = await h.innerText();
  await wait(2000);
  const n = sql(
    `select count(*) from "ProblemLike" l join "Problem" p on p.id=l."problemId" join "Collection" c on c.id=p."collectionId" where c.cid='demo' and p.pid='A1' and l."userId"='u-viewer'`,
  );
  await p._ctx.close();
  return [
    Number(now) === Number(before) + 1 && n === "1",
    `${before} -> ${now}, stored ${n}`,
  ];
});
await check("like.not-focusable", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/A1");
  const tab = await p.locator("div.group").first().getAttribute("tabindex");
  const role = await p.locator("div.group").first().getAttribute("role");
  await p._ctx.close();
  return [tab === null && role === null, ""];
});
await check("arch.hides-from-list", async () => {
  const p = await page("admin");
  await p.goto(BASE + "/c/demo/p/A24");
  await p.getByText("Archive", { exact: true }).click();
  await wait(2000);
  await p.goto(BASE + "/c/demo");
  const t = await p.locator("ul").first().innerText();
  await p.goto(BASE + "/c/demo/p/A24");
  await p.getByText("Archive", { exact: true }).click();
  await wait(2000);
  await p._ctx.close();
  return [!t.includes("Filler problem 24"), ""];
});
await check("arch.viewer-no-switch", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/A24");
  const n = await p.getByText("Archive", { exact: true }).count();
  await p._ctx.close();
  return [n === 0, ""];
});

// ---------- testsolving ----------
await check("type.chooser-redirect", async () => {
  const p = await page("unchosen");
  await p.goto(BASE + "/c/ts/p/A1");
  const u = p.url();
  const dis = await p.getByRole("button", { name: "Confirm" }).isDisabled();
  await p._ctx.close();
  return [u.endsWith("/c/ts/choose-testsolver-type") && dis, u];
});
await check("type.cards-not-focusable", async () => {
  const p = await page("unchosen");
  await p.goto(BASE + "/c/ts/choose-testsolver-type");
  const tabs = [];
  for (let i = 0; i < 6; i++) {
    await p.keyboard.press("Tab");
    tabs.push(
      await p.evaluate(
        () =>
          document.activeElement?.tagName +
          ":" +
          (document.activeElement?.textContent || "").slice(0, 12),
      ),
    );
  }
  await p._ctx.close();
  return [
    !tabs.some((t) => t.includes("Serious") || t.includes("Casual")),
    JSON.stringify(tabs),
  ];
});
await check("type.choose-casual", async () => {
  const p = await page("unchosen");
  await p.goto(BASE + "/c/ts/choose-testsolver-type");
  await p.getByText("Casual", { exact: true }).click();
  await p.getByRole("button", { name: "Confirm" }).click();
  await p.waitForURL(/\/c\/ts$/, { timeout: 10000 });
  const locks = await p.getByText("Testsolve to view").count();
  await p._ctx.close();
  return [locks === 0, `locks ${locks}`];
});
await check("type.chooser-reopen-no-selection", async () => {
  const p = await page("casual");
  await p.goto(BASE + "/c/ts/choose-testsolver-type");
  const dis = await p.getByRole("button", { name: "Confirm" }).isDisabled();
  await p._ctx.close();
  return [dis, ""];
});
await check("lock.view-and-no-leak", async () => {
  const p = await page("serious");
  await p.goto(BASE + "/c/ts/p/A1");
  const t = await p.locator("body").innerText();
  const html = await p.content();
  await p._ctx.close();
  return [
    t.includes("Testsolve to view") &&
      t.includes("10 minutes") &&
      !html.includes("What is $1 + 1$") &&
      !html.includes("It is $2$"),
    "",
  ];
});
await check("lock.first-line-unsolved", async () => {
  const p = await page("serious");
  await p.goto(BASE + "/c/ts/p/A1");
  const a = await p.getByText("No one has solved this problem yet").count();
  await p.goto(BASE + "/c/ts/p/A2");
  const b = await p.getByText("No one has solved this problem yet").count();
  await p._ctx.close();
  return [a === 1 && b === 0, `A1 ${a}, A2 ${b}`];
});
await check("attempt.wrong-then-correct", async () => {
  const p = await page("serious");
  await p.goto(BASE + "/c/ts/p/A1");
  await p.getByRole("button", { name: "Start testsolving" }).click();
  await p.waitForSelector('input[name="answer"]');
  const cd = await p.getByText(/Time remaining/).innerText();
  await p.fill('input[name="answer"]', "3");
  await p.press('input[name="answer"]', "Enter");
  await p.getByText("is incorrect!").waitFor({ timeout: 8000 });
  const msg = await p.getByText("is incorrect!").innerText();
  const box = await p.inputValue('input[name="answer"]');
  await p.fill('input[name="answer"]', "2");
  await p.press('input[name="answer"]', "Enter");
  await p.getByText("Leaderboard").waitFor({ timeout: 10000 });
  const row = await p.locator("tr.bg-yellow-100").innerText();
  await p._ctx.close();
  return [
    cd.startsWith("Time remaining: 9m") &&
      /3 is incorrect!\s*\(4\/5\)/.test(msg) &&
      box === "" &&
      row.includes("Sam Serious"),
    `countdown "${cd}", msg "${msg}", row "${row.replace(/\s+/g, " ")}"`,
  ];
});
await check("attempt.integer-box-filters", async () => {
  const p = await page("serious");
  await p.goto(BASE + "/c/ts/p/N1");
  await p.getByRole("button", { name: "Start testsolving" }).click();
  await p.waitForSelector('input[name="answer"]');
  const i = p.locator('input[name="answer"]');
  await i.pressSequentially("0a0-7.5");
  const v = await i.inputValue();
  await p._ctx.close();
  return [v === "75", `typed "0a0-7.5" -> "${v}"`];
});
await check("attempt.five-wrong-no-end", async () => {
  const p = await page("serious2");
  await p.goto(BASE + "/c/ts/p/N1");
  await p.getByRole("button", { name: "Start testsolving" }).click();
  await p.waitForSelector('input[name="answer"]');
  for (let i = 1; i <= 5; i++) {
    await p.fill('input[name="answer"]', String(10 + i));
    await p.press('input[name="answer"]', "Enter");
    await p.getByText(`${10 + i} is incorrect!`).waitFor({ timeout: 8000 });
  }
  const still = await p.locator('input[name="answer"]').count();
  const msg = await p.getByText("is incorrect!").innerText();
  await p.fill('input[name="answer"]', "2");
  await p.press('input[name="answer"]', "Enter");
  await wait(2500);
  const t = await toasts(p);
  await p._ctx.close();
  return [
    still === 1 &&
      msg.includes("(0/5)") &&
      t.includes("Reached maximum number of submissions (5)"),
    `last "${msg}", toasts ${JSON.stringify(t)}`,
  ];
});
await check("attempt.giveup-with-answer-two-requests", async () => {
  sql(
    `delete from "SolveAttempt" where "userId"='u-serious' and "problemId"=(select p.id from "Problem" p join "Collection" c on c.id=p."collectionId" where c.cid='ts' and pid='N1')`,
  );
  const p = await page("serious");
  const a = trackActions(p);
  await p.goto(BASE + "/c/ts/p/N1");
  await p.getByRole("button", { name: "Start testsolving" }).click();
  await p.waitForSelector('input[name="answer"]');
  a.length = 0;
  await p.fill('input[name="answer"]', "2");
  await p.getByRole("button", { name: "Give Up" }).click();
  await wait(3000);
  const t = await toasts(p);
  const row = sql(
    `select "numSubmissions"||','||"gaveUp"||','||("solvedAt" is not null) from "SolveAttempt" where "userId"='u-serious' and "problemId"=(select p.id from "Problem" p join "Collection" c on c.id=p."collectionId" where c.cid='ts' and pid='N1')`,
  );
  await p._ctx.close();
  return [
    a.length === 2,
    `requests ${a.length}, attempt (subs,gaveUp,solved) ${row}, toasts ${JSON.stringify(t)}`,
  ];
});
await check("attempt.giveup-empty-box", async () => {
  const p = await page("serious2");
  const a = trackActions(p);
  await p.goto(BASE + "/c/ts/p/A1");
  await p.getByRole("button", { name: "Start testsolving" }).click();
  await p.waitForSelector('input[name="answer"]');
  a.length = 0;
  await p.getByRole("button", { name: "Give Up" }).click();
  await p.getByText("Leaderboard").waitFor({ timeout: 10000 });
  await p._ctx.close();
  return [a.length === 1, `requests ${a.length}`];
});
await check("attempt.deadline-refresh", async () => {
  const p = await page("serious");
  await p.goto(BASE + "/c/ts/p/A2");
  await p.getByRole("button", { name: "Start testsolving" }).click();
  await p.waitForSelector('input[name="answer"]');
  sql(
    `update "SolveAttempt" set "startedAt" = now() - interval '9 minutes 55 seconds' where "userId"='u-serious' and "problemId"=(select p.id from "Problem" p join "Collection" c on c.id=p."collectionId" where c.cid='ts' and pid='A2')`,
  );
  await p.reload();
  await p.waitForSelector('input[name="answer"]');
  const cd = await p.getByText(/Time remaining/).innerText();
  await p.getByText("Leaderboard").waitFor({ timeout: 20000 });
  await p._ctx.close();
  return [cd.includes("0m"), `countdown after reload "${cd}", then unlocked`];
});
await check("attempt.grace-buffer", async () => {
  const p = await page("serious2");
  await p.goto(BASE + "/c/ts/p/N2");
  await p.getByRole("button", { name: "Start testsolving" }).click();
  await p.waitForSelector('input[name="answer"]');
  sql(
    `update "SolveAttempt" set "startedAt" = now() - interval '10 minutes 3 seconds' where "userId"='u-serious2' and "problemId"=(select p.id from "Problem" p join "Collection" c on c.id=p."collectionId" where c.cid='ts' and pid='N2')`,
  );
  await p.fill('input[name="answer"]', "7");
  await p.press('input[name="answer"]', "Enter");
  await wait(3000);
  const solved = sql(
    `select ("solvedAt" is not null) from "SolveAttempt" where "userId"='u-serious2' and "problemId"=(select p.id from "Problem" p join "Collection" c on c.id=p."collectionId" where c.cid='ts' and pid='N2')`,
  );
  await p._ctx.close();
  return [solved === "t", `solved within buffer: ${solved}`];
});
await check("attempt.shortanswer-math-unsolvable", async () => {
  const p = await page("serious");
  await p.goto(BASE + "/c/ts/p/C1");
  await p.getByRole("button", { name: "Start testsolving" }).click();
  await p.waitForSelector('input[name="answer"]');
  const i = p.locator('input[name="answer"]');
  await i.pressSequentially("$\\sqrt{2}$");
  const v = await i.inputValue();
  await p._ctx.close();
  return [v === "2", `box accepted "${v}"`];
});
await check("board.top5-nonauthor", async () => {
  const p = await page("serious");
  sql(
    `insert into "SolveAttempt" ("userId","problemId","startedAt","gaveUp","numSubmissions") values ('u-serious',(select p.id from "Problem" p join "Collection" c on c.id=p."collectionId" where c.cid='ts' and pid='N2'), now() - interval '1 hour', true, 0) on conflict do nothing`,
  );
  await p.goto(BASE + "/c/ts/p/N2");
  const rows = await p.locator("table tr").count();
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [
    rows === 6 &&
      /\d out of 9 testsolvers solved this problem \(showing top 5\)/.test(t),
    `rows ${rows}; ${t.match(/\d+ out of \d+[^\n]*/)?.[0]}`,
  ];
});
await check("board.author-sees-all", async () => {
  const p = await page("writer");
  await p.goto(BASE + "/c/ts/p/N2");
  const rows = await p.locator("table tr").count();
  await p._ctx.close();
  return [rows === 9, `rows ${rows}`];
});
await check("board.casual-sees", async () => {
  const p = await page("casual");
  await p.goto(BASE + "/c/ts/p/A1");
  const n = await p.getByText("Leaderboard").count();
  await p._ctx.close();
  return [n === 1, ""];
});

// ---------- cross-cutting ----------
await check("math.title-raw-reader", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/A3");
  const t = await p.locator("h2").first().innerText();
  await p._ctx.close();
  return [t.includes("$x^2$"), t];
});
await check("math.error-red-unclosed-literal", async () => {
  const p = await page("viewer");
  await p.goto(BASE + "/c/demo/p/A3");
  const err = await p.locator(".katex-error").count();
  const t = await p.locator("body").innerText();
  await p._ctx.close();
  return [
    true,
    `katex-error elements ${err}; literal "$" shown: ${t.includes("Unclosed $")}`,
  ];
});
await check("fresh.editor-keeps-text", async () => {
  const a = await page("admin");
  const b = await page("writer");
  await a.goto(BASE + "/c/demo/p/C1");
  await b.goto(BASE + "/c/demo/p/C1");
  await b
    .locator("h2")
    .first()
    .getByText(/counting problem/)
    .click();
  await b.locator('input[name="title"]').fill("Changed by B");
  await b.locator('input[name="title"]').press("Enter");
  await wait(1500);
  await a.locator("div.group").first().click();
  await wait(2500);
  const t = await a.locator("h2").first().innerText();
  await a.reload();
  const t2 = await a.locator("h2").first().innerText();
  await a._ctx.close();
  await b._ctx.close();
  return [
    !t.includes("Changed by B") && t2.includes("Changed by B"),
    `after refresh "${t.replace(/\n/g, " ")}", after reload "${t2.replace(/\n/g, " ")}"`,
  ];
});
await check("fresh.prefetch-stale", async () => {
  const a = await page("viewer");
  const b = await page("admin");
  await a.goto(BASE + "/c/demo");
  await wait(4000);
  await b.goto(BASE + "/c/demo/p/A23");
  await b.getByText("Filler statement number 23.").click();
  await b.locator('textarea[name="statement"]').fill("Fresh statement 23");
  await b.getByRole("button", { name: "Save changes" }).click();
  await wait(2000);
  await a.getByText("Filler problem 23").click();
  await a.waitForURL(/\/p\/A23/);
  await wait(1500);
  const stale = (await a.getByText("Fresh statement 23").count()) === 0;
  await a._ctx.close();
  await b._ctx.close();
  return [stale, stale ? "stale page shown" : "fresh page shown"];
});
await check("fresh.session-not-renewed", async () => {
  const p = await page("viewer");
  const resp = await p.goto(BASE + "/c/demo");
  const h = await resp.allHeaders();
  await p._ctx.close();
  return [!(h["set-cookie"] || "").includes("authjs.session-token"), ""];
});
await check("a11y.static-titles", async () => {
  const p = await page("viewer");
  const titles = [];
  for (const u of [
    "/",
    "/c/demo",
    "/c/demo/p/A1",
    "/need-permission",
    "/login",
  ]) {
    await p.goto(BASE + u);
    titles.push(await p.title());
  }
  await p._ctx.close();
  return [titles.every((t) => t === "Probase"), JSON.stringify(titles)];
});
await check("a11y.click-to-edit-not-tabbable", async () => {
  const p = await page("admin");
  await p.goto(BASE + "/c/demo/p/A1");
  const seen = [];
  for (let i = 0; i < 12; i++) {
    await p.keyboard.press("Tab");
    seen.push(
      await p.evaluate(
        () =>
          document.activeElement?.tagName +
          (document.activeElement?.getAttribute("name")
            ? ":" + document.activeElement.getAttribute("name")
            : ""),
      ),
    );
  }
  await p._ctx.close();
  return [
    !seen.some((s) => s.includes("title") || s.includes("statement")),
    JSON.stringify(seen),
  ];
});
await check("narrow.sidebar-width", async () => {
  const p = await page(null, { viewport: { width: 375, height: 700 } });
  await p.goto(BASE + "/");
  const w = await p
    .locator('[aria-label="Sidenav"]')
    .evaluate((e) => e.getBoundingClientRect().width);
  await p._ctx.close();
  return [w === 160, `${w}px`];
});
await check("narrow.need-permission-overflow", async () => {
  const p = await page("stranger", { viewport: { width: 375, height: 700 } });
  await p.goto(BASE + "/need-permission");
  await p.waitForLoadState("load");
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  await p._ctx.close();
  return [sw > 375, `page scrollWidth ${sw}px in a 375px window`];
});
await check("narrow.card-heart-bottom-row", async () => {
  const p = await page("viewer", { viewport: { width: 375, height: 700 } });
  await p.goto(BASE + "/c/demo");
  const visible = await p
    .locator("ul > li")
    .first()
    .locator("div.group")
    .evaluateAll((els) => els.map((e) => e.offsetParent !== null));
  await p._ctx.close();
  return [JSON.stringify(visible) === "[false,true]", JSON.stringify(visible)];
});

await browser.close();
writeFileSync(
  process.env.VERIFY_RESULTS ?? "verification-results.json",
  JSON.stringify(out, null, 2),
);
const counts = Object.values(out).reduce(
  (a, r) => ((a[r.result] = (a[r.result] || 0) + 1), a),
  {},
);
console.log("TOTAL", Object.keys(out).length, JSON.stringify(counts));
