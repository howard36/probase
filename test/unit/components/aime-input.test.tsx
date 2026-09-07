import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import AimeInput from "@/components/aime-input";

// AimeInput is a controlled component; this harness gives it real state so typing works end to end.
function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <AimeInput value={value} onValueChange={setValue} required={false} />;
}

describe("AimeInput", () => {
  it("accepts digits and strips leading zeros as the user types", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByPlaceholderText("Enter a number (0-999)");

    await user.type(input, "007");

    expect(input).toHaveValue("7");
  });

  it("caps the value at three digits", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByPlaceholderText("Enter a number (0-999)");

    await user.type(input, "1234");

    expect(input).toHaveValue("123");
  });

  it("ignores non-digit characters", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByPlaceholderText("Enter a number (0-999)");

    await user.type(input, "a-1.5");

    expect(input).toHaveValue("15");
  });

  it("allows clearing the field", async () => {
    const user = userEvent.setup();
    render(<Harness initial="42" />);
    const input = screen.getByPlaceholderText("Enter a number (0-999)");

    await user.clear(input);

    expect(input).toHaveValue("");
  });

  it("does not report invalid pasted values", () => {
    const onValueChange = vi.fn();
    render(<AimeInput value="" onValueChange={onValueChange} required />);
    const input = screen.getByPlaceholderText("Enter a number (0-999)");

    fireEvent.change(input, { target: { value: "1000" } });
    fireEvent.change(input, { target: { value: "-5" } });
    fireEvent.change(input, { target: { value: "12a" } });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("normalizes valid pasted values", () => {
    const onValueChange = vi.fn();
    render(<AimeInput value="" onValueChange={onValueChange} required />);
    const input = screen.getByPlaceholderText("Enter a number (0-999)");

    fireEvent.change(input, { target: { value: "099" } });

    expect(onValueChange).toHaveBeenCalledWith("99");
  });

  it("submits under the field name 'answer'", () => {
    render(<AimeInput value="" onValueChange={() => {}} required />);
    expect(
      screen.getByPlaceholderText("Enter a number (0-999)"),
    ).toHaveAttribute("name", "answer");
  });
});
