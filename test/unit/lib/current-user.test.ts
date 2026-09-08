import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";
import { auth } from "auth";
import { getCurrentUser, requireCurrentUser } from "@/lib/current-user";
import { expectRedirect } from "../../integration/navigation";

vi.mock("auth", () => ({ auth: vi.fn() }));
const mockedAuth = vi.mocked(auth as () => Promise<Session | null>);

const session = {
  expires: "2030-01-01T00:00:00.000Z",
  userId: "user-1",
  currentEmail: "user@example.com",
  emailVerified: true,
} as Session;

beforeEach(() => {
  mockedAuth.mockReset();
});

describe("getCurrentUser", () => {
  it("returns null when signed out", async () => {
    mockedAuth.mockResolvedValue(null);
    expect(await getCurrentUser()).toBeNull();
  });

  it("returns the user id and the session when signed in", async () => {
    mockedAuth.mockResolvedValue(session);
    expect(await getCurrentUser()).toEqual({ userId: "user-1", session });
  });

  it("throws when a session has no user id, which is a misconfiguration", async () => {
    mockedAuth.mockResolvedValue({ ...session, userId: undefined });
    await expect(getCurrentUser()).rejects.toThrow(
      "userId is undefined despite being logged in",
    );
  });
});

describe("requireCurrentUser", () => {
  it("returns the user when signed in", async () => {
    mockedAuth.mockResolvedValue(session);
    expect(await requireCurrentUser("/c/x")).toEqual({
      userId: "user-1",
      session,
    });
  });

  it("redirects to sign-in with the encoded callback path when signed out", async () => {
    mockedAuth.mockResolvedValue(null);
    await expectRedirect(
      requireCurrentUser("/c/x/p/A1"),
      "/api/auth/signin?callbackUrl=%2Fc%2Fx%2Fp%2FA1",
    );
  });
});
