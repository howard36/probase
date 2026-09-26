import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PrefetchLink from "@/components/prefetch-link";

const prefetch = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch }) }));

describe("PrefetchLink", () => {
  it("prefetches its page in full when it gets keyboard focus", () => {
    const onFocus = vi.fn();
    render(
      <PrefetchLink href="/c/demo/p/A1" onFocus={onFocus}>
        A1
      </PrefetchLink>,
    );

    fireEvent.focus(screen.getByRole("link", { name: "A1" }));

    expect(prefetch).toHaveBeenCalledWith("/c/demo/p/A1", { kind: "full" });
    expect(onFocus).toHaveBeenCalledTimes(1);
  });
});
