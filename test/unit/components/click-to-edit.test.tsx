import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ClickToEdit from "@/components/click-to-edit";

function hiddenValue(container: HTMLElement): string | null {
  const input = container.querySelector<HTMLInputElement>(
    'input[type="hidden"][name="title"]',
  );
  return input?.value ?? null;
}

describe("ClickToEdit", () => {
  it("starts in display mode with the saved text and a hidden form field", () => {
    const { container } = render(
      <ClickToEdit
        type="input"
        name="title"
        initialText="Before"
        autosave={true}
        onSave={() => {}}
        required={false}
      />,
    );

    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(hiddenValue(container)).toBe("Before");
  });

  it("saves optimistically for a synchronous saver", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const { container } = render(
      <ClickToEdit
        type="input"
        name="title"
        initialText="Before"
        autosave={true}
        onSave={onSave}
        required={false}
      />,
    );

    await user.click(screen.getByText("Before"));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "After{Enter}");

    expect(onSave).toHaveBeenCalledWith("After");
    expect(screen.getByText("After")).toBeInTheDocument();
    expect(hiddenValue(container)).toBe("After");
  });

  it("keeps the new text when an async save succeeds", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <ClickToEdit
        type="input"
        name="title"
        initialText="Before"
        autosave={true}
        onSave={onSave}
        required={false}
      />,
    );

    await user.click(screen.getByText("Before"));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "After{Enter}");
    await act(async () => {});

    expect(screen.getByText("After")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("reopens the editor with the draft, and restores the old value, when a save fails", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(false);
    const { container } = render(
      <ClickToEdit
        type="input"
        name="title"
        initialText="Before"
        autosave={true}
        onSave={onSave}
        required={false}
      />,
    );

    await user.click(screen.getByText("Before"));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "After{Enter}");
    await act(async () => {});

    // Editor is open again, holding the user's draft, so nothing is lost.
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("After");
    expect(hiddenValue(container)).toBeNull();

    // Escape discards the draft and shows the last saved value.
    await user.keyboard("{Escape}");
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(hiddenValue(container)).toBe("Before");
  });

  it("lets the user retry after a failed save", async () => {
    const user = userEvent.setup();
    const onSave = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    render(
      <ClickToEdit
        type="input"
        name="title"
        initialText="Before"
        autosave={true}
        onSave={onSave}
        required={false}
      />,
    );

    await user.click(screen.getByText("Before"));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "After{Enter}");
    await act(async () => {});
    expect(screen.getByRole("textbox")).toHaveValue("After");

    await user.type(screen.getByRole("textbox"), "{Enter}");
    await act(async () => {});

    expect(onSave).toHaveBeenNthCalledWith(2, "After");
    expect(screen.getByText("After")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
