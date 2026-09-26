import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CountdownTimer from "@/app/c/[cid]/p/[pid]/countdown-timer";
import Leaderboard from "@/app/c/[cid]/p/[pid]/leaderboard";
import Lightbulbs from "@/components/lightbulbs";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

afterEach(() => {
  vi.useRealTimers();
});

describe("CountdownTimer", () => {
  it("is a timer, and announces the last five minutes, the last minute and the end", () => {
    vi.useFakeTimers();
    render(
      <CountdownTimer deadline={new Date(Date.now() + 5 * 60_000 + 2_000)} />,
    );
    const status = screen.getByRole("status");

    expect(screen.getByRole("timer")).toHaveTextContent(
      "Time remaining: 5m 2s",
    );
    expect(status).toHaveTextContent("");

    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(status).toHaveTextContent("5 minutes left");

    act(() => {
      vi.advanceTimersByTime(4 * 60_000);
    });
    expect(status).toHaveTextContent("1 minute left");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(status).toHaveTextContent("Time is up");
  });
});

describe("Leaderboard", () => {
  const attempt = (userId: string, name: string, solvedAfterMs: number) => ({
    userId,
    problemId: 1,
    startedAt: new Date(0),
    solvedAt: new Date(solvedAfterMs),
    numSubmissions: 1,
    gaveUp: false,
    user: { name },
  });

  it("has column headers and says which row is the user's", () => {
    render(
      <Leaderboard
        solveAttempts={[
          attempt("a", "Ada", 60_000),
          attempt("me", "Me", 90_000),
        ]}
        userId="me"
        canViewAll={true}
      />,
    );

    expect(
      screen.getAllByRole("columnheader").map((h) => h.textContent),
    ).toEqual(["Rank", "Testsolver", "Wrong answers", "Solve time"]);
    const rows = screen.getAllByRole("row");
    expect(within(rows[2]).getByText("(you)")).toBeInTheDocument();
    expect(within(rows[1]).queryByText("(you)")).not.toBeInTheDocument();
  });
});

describe("Lightbulbs", () => {
  it("states the difficulty in words", () => {
    render(<Lightbulbs difficulty={3} />);

    expect(
      screen.getByRole("img", { name: "Difficulty 3 of 5" }),
    ).toBeInTheDocument();
  });
});
