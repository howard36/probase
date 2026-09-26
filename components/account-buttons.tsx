"use client";

import { signOutOfProbase, switchAccount } from "@/lib/account-actions";
import { wrapAction } from "@/lib/server-actions";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => wrapAction(signOutOfProbase)()}
      className="text-slate-600 underline hover:text-slate-800"
    >
      Sign out
    </button>
  );
}

/** Signs out first, so the chosen Google account is signed in as itself. */
export function SwitchAccountButton({
  callbackPath,
  label = "Log in with another Google account",
}: {
  /** Same-site path to return to after signing in. */
  callbackPath: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => wrapAction(switchAccount)(callbackPath)}
      className="block w-full rounded-md border-2 border-slate-300 py-3 text-slate-800 hover:bg-slate-200"
    >
      {label}
    </button>
  );
}
