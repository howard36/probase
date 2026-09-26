import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Testsolve from "@/app/c/[cid]/p/[pid]/testsolve";
import {
  giveUpTestsolve,
  submitTestsolve,
} from "@/app/c/[cid]/p/[pid]/actions";

vi.mock("@/app/c/[cid]/p/[pid]/actions", () => ({
  giveUpTestsolve: vi.fn(),
  submitTestsolve: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const giveUp = vi.mocked(giveUpTestsolve);
const submit = vi.mocked(submitTestsolve);

beforeEach(() => {
  giveUp.mockReset().mockResolvedValue({ ok: true });
  submit.mockReset().mockResolvedValue({
    ok: true,
    data: { correct: false, remaining: 4 },
  });
});

function renderTestsolve() {
  render(
    <Testsolve
      problemId={7}
      deadline={new Date(Date.now() + 10 * 60_000)}
      answerFormat="Integer"
    />,
  );
}

describe("Testsolve", () => {
  it("submits the typed answer", async () => {
    const user = userEvent.setup();
    renderTestsolve();

    await user.type(screen.getByRole("textbox"), "12");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(submit).toHaveBeenCalledWith(7, "12"));
    expect(giveUp).not.toHaveBeenCalled();
  });

  it("gives up without also submitting the typed answer", async () => {
    const user = userEvent.setup();
    renderTestsolve();

    await user.type(screen.getByRole("textbox"), "12");
    await user.click(screen.getByRole("button", { name: "Give Up" }));

    await waitFor(() => expect(giveUp).toHaveBeenCalledWith(7));
    expect(giveUp).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
  });

  it("gives up with an empty answer box", async () => {
    const user = userEvent.setup();
    renderTestsolve();

    await user.click(screen.getByRole("button", { name: "Give Up" }));

    await waitFor(() => expect(giveUp).toHaveBeenCalledWith(7));
    expect(submit).not.toHaveBeenCalled();
  });

  it("labels the answer box", () => {
    renderTestsolve();

    expect(screen.getByRole("textbox", { name: "ANSWER" })).toBeInTheDocument();
  });
});
