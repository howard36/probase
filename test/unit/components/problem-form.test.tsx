import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Collection } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProblemForm from "@/app/c/[cid]/add-problem/problem-form";
import { addProblem } from "@/app/c/[cid]/add-problem/actions";
import { error } from "@/lib/server-actions";

vi.mock("@/app/c/[cid]/add-problem/actions", () => ({ addProblem: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ prefetch: vi.fn() }),
}));
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

/** Fills in the required fields and the two menus, as a user would. */
async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByPlaceholderText("Short and catchy title"),
    "A title",
  );
  await user.type(
    screen.getByPlaceholderText(/^Given a triangle/),
    "A statement",
  );
  const [subject, difficulty] = screen.getAllByRole("combobox");
  await user.selectOptions(subject, "NumberTheory");
  await user.selectOptions(difficulty, "4");
  return { subject, difficulty };
}

describe("ProblemForm", () => {
  it("keeps the chosen subject and difficulty after a refused submit", async () => {
    mockedAddProblem.mockResolvedValue(
      error("You do not have permission to add a problem"),
    );
    const user = userEvent.setup();
    render(
      <ProblemForm
        collection={collection}
        canViewCollection={true}
        submission={null}
      />,
    );
    const { subject, difficulty } = await fillForm(user);
    const submit = screen.getByRole("button", { name: "Submit" });

    await user.click(submit);
    await waitFor(() => expect(mockedAddProblem).toHaveBeenCalledTimes(1));
    expect(sentField(0, "subject")).toBe("NumberTheory");
    // Let the refusal come back and the form settle.
    await waitFor(() => expect(submit).toBeEnabled());

    expect(subject).toHaveValue("NumberTheory");
    expect(difficulty).toHaveValue("4");

    await user.click(submit);
    await waitFor(() => expect(mockedAddProblem).toHaveBeenCalledTimes(2));
    expect(sentField(1, "subject")).toBe("NumberTheory");
    expect(sentField(1, "difficulty")).toBe("4");
    expect(sentField(1, "title")).toBe("A title");
    expect(sentField(1, "statement")).toBe("A statement");
  });

  it("does not submit without the required fields", async () => {
    const user = userEvent.setup();
    render(
      <ProblemForm
        collection={collection}
        canViewCollection={true}
        submission={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(mockedAddProblem).not.toHaveBeenCalled();
  });

  it("disables Submit while the problem is being sent", async () => {
    mockedAddProblem.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(
      <ProblemForm
        collection={collection}
        canViewCollection={true}
        submission={null}
      />,
    );
    await fillForm(user);
    const submit = screen.getByRole("button", { name: "Submit" });

    await user.click(submit);
    await waitFor(() => expect(submit).toBeDisabled());
    await user.click(submit);

    expect(mockedAddProblem).toHaveBeenCalledTimes(1);
  });

  it("confirms a submission, and offers no link back to a collection the member cannot view", () => {
    render(
      <ProblemForm
        collection={collection}
        canViewCollection={false}
        submission={{ pid: "G4", title: "My problem" }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      'Thanks! Your problem "My problem" was submitted to Demo as G4.',
    );
    expect(screen.queryByText("Back to Demo")).not.toBeInTheDocument();
  });

  it("does not close an open field when Submit is pressed, so the button stays under the pointer", async () => {
    const user = userEvent.setup();
    render(
      <ProblemForm
        collection={collection}
        canViewCollection={true}
        submission={null}
      />,
    );
    const solution = screen.getByPlaceholderText(/^Since \$O\$/);
    await user.type(solution, "A solution");

    const pressed = fireEvent.mouseDown(
      screen.getByRole("button", { name: "Submit" }),
    );

    // The press does not move focus, so the field neither blurs nor closes.
    expect(pressed).toBe(false);
    expect(solution).toHaveFocus();
    expect(solution).toBeInTheDocument();
  });
});
