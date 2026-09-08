import { describe, expect, it } from "vitest";
import { isInviteExpired } from "@/app/invite/[code]/expiry";

const now = new Date("2024-06-01T12:00:00Z");

describe("isInviteExpired", () => {
  it("never expires an invite with no expiry", () => {
    expect(isInviteExpired({ expiresAt: null }, now)).toBe(false);
  });

  it("is expired once the expiry has passed, including exactly now", () => {
    expect(
      isInviteExpired({ expiresAt: new Date("2024-05-31T12:00:00Z") }, now),
    ).toBe(true);
    expect(isInviteExpired({ expiresAt: now }, now)).toBe(true);
  });

  it("is not expired before the expiry", () => {
    expect(
      isInviteExpired({ expiresAt: new Date("2024-06-02T12:00:00Z") }, now),
    ).toBe(false);
  });
});
