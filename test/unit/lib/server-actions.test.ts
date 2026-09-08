import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type ActionResponse,
  type ActionResponseOk,
  UNEXPECTED_ERROR_MESSAGE,
  error,
  unexpectedError,
  wrapAction,
} from "@/lib/server-actions";

describe("error", () => {
  it("builds a failed ActionResponse carrying the message", () => {
    expect(error("nope")).toEqual({ ok: false, error: { message: "nope" } });
  });
});

describe("unexpectedError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs the real error with the action name and returns the generic message", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const boom = new Error("Unique constraint failed on the fields: (`pid`)");

    expect(unexpectedError("addProblem", boom)).toEqual(
      error(UNEXPECTED_ERROR_MESSAGE),
    );
    expect(consoleError).toHaveBeenCalledWith(
      "Unexpected error in addProblem:",
      boom,
    );
  });
});

describe("wrapAction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Let the fire-and-forget promise inside wrapAction settle.
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

  it("returns a synchronous function that forwards its arguments", async () => {
    const action = vi
      .fn<(a: number, b: string) => Promise<ActionResponse>>()
      .mockResolvedValue({ ok: true });
    const wrapped = wrapAction(action);

    const result = wrapped(1, "two") as unknown;
    await flush();

    expect(result).toBeUndefined();
    expect(action).toHaveBeenCalledWith(1, "two");
  });

  it("calls onSuccess with the successful response", async () => {
    const action = (): Promise<ActionResponse<{ n: number }>> =>
      Promise.resolve({ ok: true, data: { n: 7 } });
    const onSuccess = vi.fn<(resp: ActionResponseOk<{ n: number }>) => void>();

    wrapAction(action, onSuccess)();
    await flush();

    expect(onSuccess).toHaveBeenCalledWith({ ok: true, data: { n: 7 } });
  });

  it("logs an error response and does not call onSuccess", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const action = (): Promise<ActionResponse> =>
      Promise.resolve(error("Not signed in"));
    const onSuccess = vi.fn();

    wrapAction(action, onSuccess)();
    await flush();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "Server action returned error: ",
      "Not signed in",
    );
  });

  it("catches a rejected action instead of leaving an unhandled rejection", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const boom = new Error("boom");
    const action = (): Promise<ActionResponse> => Promise.reject(boom);

    expect(() => wrapAction(action)()).not.toThrow();
    await flush();

    expect(consoleError).toHaveBeenCalledWith(boom);
  });

  it("treats an undefined response (post-redirect) as a no-op with a warning", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    // Next.js server actions that redirect resolve to undefined on the client.
    const action = () =>
      Promise.resolve(undefined) as unknown as Promise<ActionResponse>;
    const onSuccess = vi.fn();

    wrapAction(action, onSuccess)();
    await flush();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).toHaveBeenCalledTimes(1);
  });
});
