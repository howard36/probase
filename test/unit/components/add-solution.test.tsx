import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddSolution from "@/app/c/[cid]/p/[pid]/add-solution";
import { addSolution } from "@/app/c/[cid]/p/[pid]/actions";
import { error } from "@/lib/server-actions";

vi.mock("@/app/c/[cid]/p/[pid]/actions", () => ({ addSolution: vi.fn() }));

const mockedAddSolution = vi.mocked(addSolution);

beforeEach(() => {
  mockedAddSolution.mockReset();
});

async function openAndType(text: string) {
  const user = userEvent.setup();
  render(<AddSolution problemId={4} />);
  await user.click(screen.getByRole("button", { name: "Add Solution" }));
  if (text !== "") {
    await user.type(
      screen.getByPlaceholderText("Write your solution here!"),
      text,
    );
  }
  return user;
}

describe("AddSolution", () => {
  it("sends one solution for a double click, and disables Submit meanwhile", async () => {
    let answer: (value: { ok: true }) => void = () => {};
    mockedAddSolution.mockReturnValue(
      new Promise((resolve) => (answer = resolve)),
    );
    const user = await openAndType("Proof");
    const submit = screen.getByRole("button", { name: "Submit" });

    await user.dblClick(submit);
    await user.keyboard("{Control>}{Enter}{/Control}");

    await waitFor(() => expect(submit).toBeDisabled());
    expect(mockedAddSolution).toHaveBeenCalledTimes(1);
    expect(mockedAddSolution).toHaveBeenCalledWith(4, "Proof");
    // Settle the request: React ties later transitions to an unfinished one.
    answer({ ok: true });
    await waitFor(() => expect(submit).toBeEnabled());
  });

  it("keeps the text after a refusal, for another try", async () => {
    mockedAddSolution.mockResolvedValue(
      error("This problem already has a solution. Reload the page to see it."),
    );
    const user = await openAndType("Proof");
    const submit = screen.getByRole("button", { name: "Submit" });

    await user.click(submit);
    await waitFor(() => expect(submit).toBeEnabled());

    expect(
      screen.getByPlaceholderText("Write your solution here!"),
    ).toHaveValue("Proof");
    await user.click(submit);
    expect(mockedAddSolution).toHaveBeenCalledTimes(2);
  });

  it("sends nothing while the box is empty", async () => {
    const user = await openAndType("");

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(mockedAddSolution).not.toHaveBeenCalled();
  });
});
