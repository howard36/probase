"use client";

import { useRouter } from "next/navigation";
import CountdownTimer from "./countdown-timer";
import AimeInput from "../../add-problem/aime-input";
import { useState } from "react";
import Label from "@/components/label";
import { SolveAttempt } from "@prisma/client";
import { ProblemProps } from "./types";
import SubmitButton from "@/components/submit-button";
import { giveUpTestsolve, submitTestsolve } from "./actions";
import { wrapAction } from "@/lib/server-actions";

// TODO: fix loading spinners for the two submit buttons. Probably need to show a single loading spinner outside of the buttons. That also lets us keep the same button text and width
export default function Testsolve({
  problem,
  deadline,
}: {
  problem: ProblemProps;
  solveAttempt: SolveAttempt;
  deadline: Date;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [wrongAnswer, setWrongAnswer] = useState("");

  const trySubmitTestsolve = wrapAction(submitTestsolve, (resp) => {
    if (resp.data.correct) {
      router.refresh();
    } else {
      setWrongAnswer(answer);
      setAnswer("");
    }
  });

  const tryGiveUpTestsolve = wrapAction(giveUpTestsolve, () =>
    router.refresh(),
  );

  return (
    <div>
      <form
        action={() => trySubmitTestsolve(problem.id, answer)}
        className="mb-8"
      >
        <Label text="ANSWER" />
        <div className="mb-3">
          <AimeInput
            value={answer}
            onValueChange={(newValue: string) => setAnswer(newValue)}
            required
          />
        </div>
        <div className="my-4 flex items-center gap-x-6">
          <SubmitButton className="flex-grow-0">Submit</SubmitButton>
          <SubmitButton
            onClick={() => tryGiveUpTestsolve(problem.id)}
            className="flex-grow-0 bg-red-500 shadow-red-500/20 hover:bg-red-600 hover:shadow-red-500/20 focus-visible:ring-red-300 active:bg-red-700 active:shadow-red-500/20 disabled:bg-red-300"
          >
            Give Up
          </SubmitButton>
        </div>
        <div className="mb-3">
          {wrongAnswer && (
            <span>
              <strong>{wrongAnswer}</strong> is incorrect!
            </span>
          )}
        </div>
      </form>
      <CountdownTimer deadline={deadline} />
    </div>
  );
}
