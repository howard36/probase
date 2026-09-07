import type { Session } from "next-auth";
import type { Mock } from "vitest";
import { auth } from "auth";

// `auth` is mocked in ./setup.ts; this is the handle the tests use to control it.
const mockedAuth = auth as unknown as Mock<() => Promise<Session | null>>;

/**
 * Make `auth()` resolve to a session for the given user, or to `null` when signed out.
 * Only the fields the app reads (`userId`, `currentEmail`) are populated.
 */
export function signInAs(
  user: { id: string; email?: string | null } | null,
): void {
  if (user === null) {
    mockedAuth.mockResolvedValue(null);
    return;
  }
  const session = {
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    userId: user.id,
    currentEmail: user.email ?? null,
    emailVerified: true,
  } as Session;
  mockedAuth.mockResolvedValue(session);
}

export function signOut(): void {
  signInAs(null);
}
