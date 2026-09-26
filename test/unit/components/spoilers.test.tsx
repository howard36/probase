import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Spoilers from "@/app/c/[cid]/p/[pid]/spoilers";

function renderSpoilers() {
  render(
    <Spoilers>
      <p>The answer is 42</p>
      <textarea aria-label="Draft solution" />
    </Spoilers>,
  );
}

describe("Spoilers", () => {
  it("starts hidden, and shows and hides its contents", async () => {
    const user = userEvent.setup();
    renderSpoilers();
    const toggle = screen.getByRole("button", { name: "Show spoilers" });

    expect(screen.queryByText("The answer is 42")).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(screen.getByText("The answer is 42")).toBeVisible();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName("Hide spoilers");

    await user.click(toggle);
    expect(screen.getByText("The answer is 42")).not.toBeVisible();
  });

  it("keeps a draft typed inside when hidden and shown again", async () => {
    const user = userEvent.setup();
    renderSpoilers();
    const toggle = screen.getByRole("button", { name: "Show spoilers" });

    await user.click(toggle);
    await user.type(screen.getByLabelText("Draft solution"), "My proof");
    await user.click(toggle);
    await user.click(toggle);

    expect(screen.getByLabelText("Draft solution")).toHaveValue("My proof");
  });
});
