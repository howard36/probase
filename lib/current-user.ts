import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { auth } from "auth";

export interface CurrentUser {
  userId: string;
  session: Session;
}

/**
 * The signed-in user, or null when there is no session.
 *
 * Throws if the session has no user id. That is an auth misconfiguration
 * (the jwt callback in auth.ts always sets `sub`), not a signed-out user,
 * so callers do not need to handle it.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (session === null) {
    return null;
  }
  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }
  return { userId, session };
}

/**
 * For pages: the signed-in user, or a redirect to the sign-in page that
 * returns to `callbackPath` once they have signed in.
 */
export async function requireCurrentUser(
  callbackPath: string,
): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect(
      `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`,
    );
  }
  return user;
}
