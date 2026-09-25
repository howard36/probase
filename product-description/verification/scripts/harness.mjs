// Shared helpers for the scripted verification pass. See ../README.md.
// Playwright is not a dependency of Probase: install it globally
// (`npm i -g playwright`) and run with NODE_PATH="$(npm root -g)".
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { encode } from "@auth/core/jwt";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

export const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const NAMES = {
  admin: ["Ada Admin", "ada@example.com"],
  writer: ["Wes Writer", "wes@example.com"],
  member: ["Tia Member", "tia@example.com"],
  serious: ["Sam Serious", "sam@example.com"],
  serious2: ["Sue Serious", "sue@example.com"],
  casual: ["Cal Casual", "cal@example.com"],
  unchosen: ["Uma Unchosen", "uma@example.com"],
  viewer: ["Vic Viewer", "vic@example.com"],
  submitter: ["Sid Submitter", "sid@example.edu"],
  stranger: ["Stan Stranger", "stan@example.com"],
  student: ["Eve Student", "eve@example.edu"],
};

/** A session cookie value for a fixture user, minted with the instance's AUTH_SECRET. */
export async function cookieFor(key) {
  const [name, email] = NAMES[key];
  return encode({
    secret: process.env.AUTH_SECRET,
    salt: "authjs.session-token",
    token: {
      sub: "u-" + key,
      name,
      email,
      currentEmail: email,
      emailVerified: true,
      givenName: name.split(" ")[0],
      familyName: name.split(" ")[1],
    },
  });
}

export function launch() {
  return chromium.launch();
}

/** A browser context signed in as a fixture user (or signed out for null). */
export async function contextAs(browser, key, opts = {}) {
  const ctx = await browser.newContext(opts);
  if (key) {
    await ctx.addCookies([
      {
        name: "authjs.session-token",
        value: await cookieFor(key),
        domain: new URL(BASE).hostname,
        path: "/",
        httpOnly: true,
      },
    ]);
  }
  return ctx;
}

/** Records the server actions (POSTs with a next-action header) a page sends. */
export function trackActions(page) {
  const actions = [];
  page.on("request", (r) => {
    if (r.method() === "POST" && r.headers()["next-action"]) {
      actions.push({ url: r.url(), body: r.postData() });
    }
  });
  return actions;
}

/** Runs one SQL statement against DATABASE_URL with psql and returns its output. */
export const sql = (q) =>
  execFileSync("psql", [process.env.DATABASE_URL, "-At", "-c", q])
    .toString()
    .trim();
