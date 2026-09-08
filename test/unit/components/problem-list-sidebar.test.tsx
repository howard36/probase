import { render, screen } from "@testing-library/react";
import type { AccessLevel, Collection, Permission } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { ProblemListSidebar } from "@/components/problem-list-sidebar";

// The search and filter children read the router; they are not under test here.
vi.mock("next/navigation", () => ({
  usePathname: () => "/c/test",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const collection = {
  id: 1,
  cid: "test",
  name: "Test",
  requireTestsolve: false,
} as Collection;

function permission(accessLevel: AccessLevel): Permission {
  return {
    id: 1,
    userId: "u",
    collectionId: 1,
    accessLevel,
    createdAt: new Date(),
    testsolverType: null,
    seriousTestsolverStartedAt: null,
  };
}

const filter = {
  subjects: [],
  search: "",
  archived: false,
  page: 1,
  unsolvedOnly: false,
};

describe("ProblemListSidebar", () => {
  it.each(["Admin", "TeamMember"] as const)(
    "shows the Add Problem link to a %s",
    (level) => {
      render(
        <ProblemListSidebar
          collection={collection}
          permission={permission(level)}
          filter={filter}
        />,
      );
      expect(screen.getByRole("link", { name: "Add Problem" })).toHaveAttribute(
        "href",
        "/c/test/add-problem",
      );
    },
  );

  it("hides the Add Problem link from a ViewOnly member", () => {
    render(
      <ProblemListSidebar
        collection={collection}
        permission={permission("ViewOnly")}
        filter={filter}
      />,
    );
    expect(
      screen.queryByRole("link", { name: "Add Problem" }),
    ).not.toBeInTheDocument();
    // The rest of the sidebar is still there.
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });
});
