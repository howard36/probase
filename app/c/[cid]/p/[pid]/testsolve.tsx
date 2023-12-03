"use client";

import { useRouter } from "next/navigation";
import CountdownTimer from "./countdown-timer";
import AimeInput from "../../add-problem/aime-input";
import { useState } from "react";
import Label from "@/components/label";
import { SolveAttempt } from "@prisma/client";
import { ProblemProps } from "./types";
import SubmitButton from "@/components/submit-button";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGivingUp, setIsGivingUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await fetch(
      `/api/problems/${problem.id}/testsolve/submit`,
      {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer,
        }),
      },
    );

    if (response.status === 200) {
      const { correct } = await response.json();
      if (correct) {
        router.refresh();
      } else {
        setWrongAnswer(answer);
        setAnswer("");
      }
    } else {
      console.error("Failed to submit guess!");
    }
    setIsSubmitting(false);
  };

  const giveUp = async () => {
    setIsGivingUp(true);

    const response = await fetch(
      `/api/problems/${problem.id}/testsolve/give-up`,
      {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );

    if (response.status === 200) {
      router.refresh();
    } else {
      console.error("Failed to submit give-up request!");
    }

    setIsGivingUp(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8">
        <Label text="ANSWER" />
        <div className="mb-3">
          <AimeInput
            value={answer}
            onValueChange={(newValue: string) => setAnswer(newValue)}
            required
          />
        </div>
        <div className="flex gap-x-6 items-center my-4">
          <SubmitButton isSubmitting={isSubmitting} className="flex-grow-0">
            Submit
          </SubmitButton>
          <SubmitButton
            isSubmitting={isGivingUp}
            onClick={giveUp}
            className="flex-grow-0 bg-red-500 hover:bg-red-600 active:bg-red-700 shadow-red-500/20 hover:shadow-red-500/20 focus-visible:ring-red-300 active:shadow-red-500/20 disabled:bg-red-300"
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
