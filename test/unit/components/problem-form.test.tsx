import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Collection } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProblemForm from "@/app/c/[cid]/add-problem/problem-form";
import { addProblem } from "@/app/c/[cid]/add-problem/actions";
import { error } from "@/lib/server-actions";

vi.mock("@/app/c/[cid]/add-problem/actions", () => ({ addProblem: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const mockedAddProblem = vi.mocked(addProblem);

const collection = {
  id: 5,
  cid: "demo",
  name: "Demo",
  answerFormat: "Integer",
  requireAnswer: false,
  requireDifficulty: true,
  requireSolution: false,
} as Collection;

beforeEach(() => {
  mockedAddProblem.mockReset();
});

function sentField(call: number, name: string) {
  const formData = mockedAddProblem.mock.calls[call][1];
  return formData.get(name);
}

describe("ProblemForm", () => {
  it("keeps the chosen subject and difficulty after a refused submit", async () => {
    mockedAddProblem.mockResolvedValue(
      error("You do not have permission to add a problem"),
    );
    const user = userEvent.setup();
    const { container } = render(
      <ProblemForm collection={collection} authorId={9} />,
    );
    const [subject, difficulty] = screen.getAllByRole("combobox");
    await user.selectOptions(subject, "NumberTheory");
    await user.selectOptions(difficulty, "4");

    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(mockedAddProblem).toHaveBeenCalledTimes(1));
    expect(sentField(0, "subject")).toBe("NumberTheory");
    // Let the refusal come back and the form settle.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled(),
    );

    expect(subject).toHaveValue("NumberTheory");
    expect(difficulty).toHaveValue("4");

    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(mockedAddProblem).toHaveBeenCalledTimes(2));
    expect(sentField(1, "subject")).toBe("NumberTheory");
    expect(sentField(1, "difficulty")).toBe("4");
    expect(sentField(1, "authorId")).toBe("9");
  });

  it("disables Submit while the problem is being sent", async () => {
    mockedAddProblem.mockReturnValue(new Promise(() => {}));
    const { container } = render(
      <ProblemForm collection={collection} authorId={9} />,
    );

    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled(),
    );
    fireEvent.submit(container.querySelector("form")!);

    expect(mockedAddProblem).toHaveBeenCalledTimes(1);
  });
});
