import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Collection, Permission } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProblemListSidebar } from "@/components/problem-list-sidebar";
import type { Filter } from "@/lib/filter";

// The router never answers here, so the filter the page was rendered with
// stays the same: exactly the moment when typed text used to be lost.
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/c/demo",
  useRouter: () => ({ replace, push: vi.fn() }),
}));

const collection = {
  id: 1,
  cid: "demo",
  name: "Demo",
  requireTestsolve: false,
} as Collection;

const permission = {
  id: 1,
  userId: "u",
  collectionId: 1,
  accessLevel: "ViewOnly",
  createdAt: new Date(),
  testsolverType: null,
  seriousTestsolverStartedAt: null,
} as Permission;

const emptyFilter: Filter = {
  subjects: [],
  search: "",
  archived: false,
  page: 1,
  unsolvedOnly: false,
};

function renderSidebar(filter: Filter = emptyFilter) {
  return render(
    <ProblemListSidebar
      collection={collection}
      permission={permission}
      filter={filter}
    />,
  );
}

function lastAddress(): string {
  return replace.mock.calls.at(-1)?.[0] as string;
}

beforeEach(() => {
  replace.mockReset();
});

describe("collection search and filters", () => {
  it("keeps every character typed quickly, and searches once typing pauses", async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.type(screen.getByPlaceholderText("Search"), "filler");

    expect(screen.getByPlaceholderText("Search")).toHaveValue("filler");
    await waitFor(() => expect(replace).toHaveBeenCalled());
    expect(replace).toHaveBeenCalledTimes(1);
    expect(lastAddress()).toBe("/c/demo?search=filler");
  });

  it("searches at once on Enter", async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.type(screen.getByPlaceholderText("Search"), "abc{Enter}");

    expect(replace).toHaveBeenCalledTimes(1);
    expect(lastAddress()).toBe("/c/demo?search=abc");
  });

  it("keeps both of two subjects clicked in quick succession", async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByRole("checkbox", { name: "Algebra" }));
    await user.click(screen.getByRole("checkbox", { name: "Geometry" }));

    expect(lastAddress()).toBe("/c/demo?subject=ag");
    expect(screen.getByRole("checkbox", { name: "Algebra" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Geometry" })).toBeChecked();
  });

  it("keeps the search when a subject is clicked while it is being typed", async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.type(screen.getByPlaceholderText("Search"), "fil");
    await user.click(screen.getByRole("checkbox", { name: "Algebra" }));

    await waitFor(() =>
      expect(lastAddress()).toBe("/c/demo?subject=a&search=fil"),
    );
    expect(screen.getByPlaceholderText("Search")).toHaveValue("fil");
  });

  it("follows a filter the page is rendered with later", () => {
    const { rerender } = renderSidebar();

    rerender(
      <ProblemListSidebar
        collection={collection}
        permission={permission}
        filter={{ ...emptyFilter, search: "moved", subjects: ["Geometry"] }}
      />,
    );

    expect(screen.getByPlaceholderText("Search")).toHaveValue("moved");
    expect(screen.getByRole("checkbox", { name: "Geometry" })).toBeChecked();
    expect(replace).not.toHaveBeenCalled();
  });
});
