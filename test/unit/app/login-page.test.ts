import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";
import { auth } from "auth";
import LoginPage from "@/app/login/page";
import GoogleLoginButton from "@/components/google-login-button";
import { clientPayload } from "../../integration/pages/client-payload";
import { expectRedirect } from "../../integration/navigation";

vi.mock("auth", () => ({ auth: vi.fn() }));
const mockedAuth = vi.mocked(auth as () => Promise<Session | null>);

const session = {
  expires: "2030-01-01T00:00:00.000Z",
  userId: "user-1",
  currentEmail: "user@example.com",
  fullName: "Ada Lovelace",
  emailVerified: true,
} as Session;

const clientComponents = new Set<unknown>([GoogleLoginButton]);

function render(searchParams: { callbackUrl?: string | string[] }) {
  return LoginPage({ searchParams: Promise.resolve(searchParams) });
}

/** The callback path handed to the login button. */
async function buttonCallback(searchParams: {
  callbackUrl?: string | string[];
}): Promise<string | undefined> {
  const payload = JSON.stringify(
    await clientPayload(await render(searchParams), clientComponents),
  );
  return /"callbackUrl":"([^"]*)"/.exec(payload)?.[1];
}

const unsafeCallbacks = [
  "https://evil.example/",
  "//evil.example/",
  "/\\evil.example/",
  "c/x",
  "",
];

beforeEach(() => {
  mockedAuth.mockReset();
});

describe("login page", () => {
  describe("signed out", () => {
    beforeEach(() => {
      mockedAuth.mockResolvedValue(null);
    });

    it("hands the button the same-site callback path", async () => {
      expect(await buttonCallback({ callbackUrl: "/c/x/p/A1" })).toBe(
        "/c/x/p/A1",
      );
    });

    it("falls back to the home page without a callback", async () => {
      expect(await buttonCallback({})).toBe("/");
    });

    it("uses the first callback when the query repeats it", async () => {
      expect(await buttonCallback({ callbackUrl: ["/c/x", "/c/y"] })).toBe(
        "/c/x",
      );
    });

    it.each(unsafeCallbacks)(
      "falls back to the home page for the unsafe callback %j",
      async (callbackUrl) => {
        expect(await buttonCallback({ callbackUrl })).toBe("/");
      },
    );
  });

  describe("signed in", () => {
    beforeEach(() => {
      mockedAuth.mockResolvedValue(session);
    });

    it("redirects straight to the callback path", async () => {
      await expectRedirect(render({ callbackUrl: "/c/x" }), "/c/x");
    });

    it.each(unsafeCallbacks)(
      "redirects to the home page for the unsafe callback %j",
      async (callbackUrl) => {
        await expectRedirect(render({ callbackUrl }), "/");
      },
    );
  });
});
