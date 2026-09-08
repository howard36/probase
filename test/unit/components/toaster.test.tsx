import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Toaster from "@/components/toaster";
import { notifyError } from "@/lib/toast";

describe("Toaster", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing until an error is sent", () => {
    const { container } = render(<Toaster />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows each error as an alert", () => {
    render(<Toaster />);

    act(() => {
      notifyError("You do not have permission to edit this problem");
      notifyError("Invite has expired");
    });

    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent(
      "You do not have permission to edit this problem",
    );
    expect(alerts[1]).toHaveTextContent("Invite has expired");
  });

  it("dismisses a toast when its close button is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Toaster />);
    act(() => {
      notifyError("nope");
    });

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("dismisses a toast on its own after a few seconds", () => {
    render(<Toaster />);
    act(() => {
      notifyError("nope");
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(8_000);
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
