import { describe, expect, it, vi } from "vitest";
import { notifyError, subscribeToErrors } from "@/lib/toast";

describe("toast channel", () => {
  it("delivers messages to the subscribed listener", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToErrors(listener);

    notifyError("nope");

    expect(listener).toHaveBeenCalledWith("nope");
    unsubscribe();
  });

  it("drops messages once unsubscribed", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToErrors(listener);
    unsubscribe();

    notifyError("nope");

    expect(listener).not.toHaveBeenCalled();
  });

  it("does not let a stale unsubscribe remove a newer listener", () => {
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = subscribeToErrors(first);
    const unsubscribeSecond = subscribeToErrors(second);
    unsubscribeFirst();

    notifyError("nope");

    expect(second).toHaveBeenCalledWith("nope");
    expect(first).not.toHaveBeenCalled();
    unsubscribeSecond();
  });
});
