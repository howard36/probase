import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Likes from "@/components/likes";
import ArchiveToggle from "@/app/c/[cid]/p/[pid]/archive-toggle";

vi.mock("@/app/c/[cid]/p/[pid]/actions", () => ({
  likeProblem: vi.fn().mockResolvedValue({ ok: true }),
  editProblem: vi.fn().mockResolvedValue({ ok: true }),
}));

describe("Likes", () => {
  it("follows likes the server reports after a refresh", () => {
    const { rerender } = render(
      <Likes problem={{ id: 1, likes: [{ userId: "other" }] }} userId="me" />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();

    rerender(
      <Likes
        problem={{ id: 1, likes: [{ userId: "other" }, { userId: "me" }] }}
        userId="me"
      />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

describe("ArchiveToggle", () => {
  it("follows the archived state the server reports after a refresh", () => {
    const { rerender } = render(
      <ArchiveToggle problemId={1} isArchived={false} />,
    );
    expect(screen.getByRole("checkbox", { name: "Archive" })).not.toBeChecked();

    rerender(<ArchiveToggle problemId={1} isArchived={true} />);

    expect(screen.getByRole("checkbox", { name: "Archive" })).toBeChecked();
  });
});
