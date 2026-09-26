"use server";

import { signIn, signOut } from "auth";
import { z } from "zod";
import { safeCallbackPath } from "@/lib/callback-path";
import type { ActionResponse } from "@/lib/server-actions";
import { parseInput } from "@/lib/validation";

/** Signs out and goes to the home page. */
export async function signOutOfProbase(): Promise<ActionResponse> {
  await signOut({ redirectTo: "/" });
  return { ok: true };
}

/**
 * Signs out, then starts a Google sign-in that asks which account to use,
 * returning to `callbackPath` (a same-site path) afterwards. Signing in while
 * still signed in would attach the chosen Google account to the current user
 * instead of switching to it.
 */
export async function switchAccount(
  callbackPath: string,
): Promise<ActionResponse> {
  const input = parseInput(z.string(), callbackPath);
  if (!input.ok) {
    return input;
  }
  await signOut({ redirect: false });
  await signIn(
    "google",
    { redirectTo: safeCallbackPath(callbackPath) },
    // "consent" is what every sign-in asks for (see auth.ts).
    { prompt: "select_account consent" },
  );
  return { ok: true };
}
