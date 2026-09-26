import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Collection } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import ChooseTestsolverTypePage from "@/components/choose-testsolver-type-page";

const collection = { id: 3, cid: "ts", name: "Testsolving" } as Collection;

function renderChooser() {
  const submitAction = vi.fn().mockResolvedValue({ ok: true });
  render(
    <ChooseTestsolverTypePage
      collection={collection}
      submitAction={submitAction}
    />,
  );
  return submitAction;
}

describe("ChooseTestsolverTypePage", () => {
  it("offers the two styles as a labelled radio group", () => {
    renderChooser();

    expect(
      screen.getByRole("radiogroup", { name: "Choose your testsolving style" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Serious" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Casual" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
  });

  it("can be chosen and confirmed with the keyboard alone", async () => {
    const user = userEvent.setup();
    const submitAction = renderChooser();

    await user.tab();
    expect(screen.getByRole("radio", { name: "Serious" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Serious" })).toBeChecked();
    await user.tab();
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveFocus();
    await user.keyboard("{Enter}");

    await waitFor(() =>
      expect(submitAction).toHaveBeenCalledWith(3, "Serious"),
    );
  });

  it("can be chosen by clicking anywhere on a card", async () => {
    const user = userEvent.setup();
    const submitAction = renderChooser();

    await user.click(screen.getByText("No time limit"));
    expect(screen.getByRole("radio", { name: "Casual" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(submitAction).toHaveBeenCalledWith(3, "Casual"));
    expect(submitAction).toHaveBeenCalledTimes(1);
  });
});
