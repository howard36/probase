import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import IntegerInput from "@/components/integer-input";

function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <IntegerInput value={value} onValueChange={setValue} required={false} />
  );
}

describe("IntegerInput", () => {
  it("accepts negative integers typed one character at a time", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByPlaceholderText("Enter an integer");

    await user.type(input, "-17");

    expect(input).toHaveValue("-17");
  });

  it("keeps a lone minus sign while the user is still typing", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByPlaceholderText("Enter an integer");

    await user.type(input, "-");

    expect(input).toHaveValue("-");
  });

  it("strips leading zeros", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByPlaceholderText("Enter an integer");

    await user.type(input, "0042");

    expect(input).toHaveValue("42");
  });

  it("ignores decimals, letters, and a second minus sign", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByPlaceholderText("Enter an integer");

    await user.type(input, "-1.5e3-");

    expect(input).toHaveValue("-153");
  });

  it("has no length limit, unlike AimeInput", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByPlaceholderText("Enter an integer");

    await user.type(input, "123456");

    expect(input).toHaveValue("123456");
  });

  it("does not report invalid pasted values", () => {
    const onValueChange = vi.fn();
    render(<IntegerInput value="" onValueChange={onValueChange} required />);
    const input = screen.getByPlaceholderText("Enter an integer");

    fireEvent.change(input, { target: { value: "1.5" } });
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.change(input, { target: { value: "--1" } });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("submits under the field name 'answer'", () => {
    render(<IntegerInput value="" onValueChange={() => {}} required />);
    expect(screen.getByPlaceholderText("Enter an integer")).toHaveAttribute(
      "name",
      "answer",
    );
  });
});
