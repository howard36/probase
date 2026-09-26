import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Sidebar from "@/components/sidebar";
import { SwitchAccountButton } from "@/components/account-buttons";
import { signOutOfProbase, switchAccount } from "@/lib/account-actions";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ prefetch: vi.fn() }),
}));
vi.mock("@/lib/account-actions", () => ({
  signOutOfProbase: vi.fn().mockResolvedValue({ ok: true }),
  switchAccount: vi.fn().mockResolvedValue({ ok: true }),
}));

describe("Sidebar", () => {
  it("shows who is signed in, and signs out", async () => {
    const user = userEvent.setup();
    render(<Sidebar signedInAs="ada@example.com">page</Sidebar>);

    expect(screen.getByText("Signed in as ada@example.com")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(signOutOfProbase).toHaveBeenCalledTimes(1);
  });

  it("offers no sign-out when signed out", () => {
    render(<Sidebar signedInAs={null}>page</Sidebar>);

    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).not.toBeInTheDocument();
  });
});

describe("SwitchAccountButton", () => {
  it("switches account, returning to the given path", async () => {
    const user = userEvent.setup();
    render(<SwitchAccountButton callbackPath="/invite/edu-demo" />);

    await user.click(
      screen.getByRole("button", {
        name: "Log in with another Google account",
      }),
    );

    expect(switchAccount).toHaveBeenCalledWith("/invite/edu-demo");
  });
});
