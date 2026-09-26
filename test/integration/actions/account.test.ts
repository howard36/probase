import { describe, expect, it, vi } from "vitest";
import { signIn, signOut } from "auth";
import { signOutOfProbase, switchAccount } from "@/lib/account-actions";

const mockedSignIn = vi.mocked(signIn);
const mockedSignOut = vi.mocked(signOut);

describe("signOutOfProbase", () => {
  it("signs out and goes to the home page", async () => {
    await signOutOfProbase();

    expect(mockedSignOut).toHaveBeenCalledWith({ redirectTo: "/" });
  });
});

describe("switchAccount", () => {
  it("signs out before asking Google which account to sign in with", async () => {
    const calls: string[] = [];
    mockedSignOut.mockImplementation(() => {
      calls.push("signOut");
      return Promise.resolve();
    });
    mockedSignIn.mockImplementation(() => {
      calls.push("signIn");
      return Promise.resolve();
    });

    await switchAccount("/invite/join-demo");

    expect(calls).toEqual(["signOut", "signIn"]);
    expect(mockedSignOut).toHaveBeenCalledWith({ redirect: false });
    expect(mockedSignIn).toHaveBeenCalledWith(
      "google",
      { redirectTo: "/invite/join-demo" },
      { prompt: "select_account consent" },
    );
  });

  it("returns only to a path on this site", async () => {
    await switchAccount("//evil.example");

    expect(mockedSignIn).toHaveBeenCalledWith(
      "google",
      { redirectTo: "/" },
      expect.anything(),
    );
  });

  it("rejects a malformed argument without signing out", async () => {
    const result = await switchAccount(42 as unknown as string);

    expect(result.ok).toBe(false);
    expect(mockedSignOut).not.toHaveBeenCalled();
  });
});
