'use client'

import { useRouter } from "next/navigation";
import CountdownTimer from './countdown-timer'
import AimeInput from "../../add-problem/aime-input";
import { useState } from "react";
import Label from "@/components/label";
import { SolveAttempt } from "@prisma/client";
import { ProblemProps } from "./types";

export default function Testsolve({problem, solveAttempt, deadline}: {problem: ProblemProps, solveAttempt: SolveAttempt, deadline: Date}) {
  const router = useRouter();
  const [answer, setAnswer] = useState('');
  const [wrongAnswer, setWrongAnswer] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [isGivingUp, setGivingUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const response = await fetch(`/api/problems/${problem.id}/testsolve/submit`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer,
      }),
    });

    if (response.status === 200) {
      const { correct } = await response.json();
      if (correct) {
        router.refresh();
      } else {
        setWrongAnswer(answer);
        setAnswer('');
      }
    }
  };
  
  const handleGiveUp = async () => {
    setGivingUp(true);

    await fetch(`/api/problems/${problem.id}/testsolve/give-up`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    router.refresh();
    setGivingUp(false);
  };

  return <div>
    <form onSubmit={handleSubmit} className="mb-8">
      <Label text="ANSWER" />
      <div className="mb-3">
        <AimeInput value={answer} onValueChange={(newValue: string) => setAnswer(newValue)} required />
      </div>
      <div className="flex gap-x-6 items-center my-4">
        {/* TODO: make this a component */}
        <button disabled={isSubmitting || answer === ''} type="submit" className={`text-white text-lg font-bold rounded border-0 py-2 w-40 flex-grow-0 ${answer === '' ? "bg-slate-300" : "bg-sky-500 hover:bg-sky-600"} focus:outline-none flex flex-auto items-center justify-center`}>
          { isSubmitting && <div className="animate-spin rounded-full border-solid border-sky-400 border-l-sky-50 border-4 h-6 w-6 mr-3 inline-block"></div> }
          { isSubmitting ? "Saving..." : "Submit" }
        </button>
        <button disabled={isGivingUp} type="button" onClick={handleGiveUp} className={`group text-red-500 hover:text-red-600 text-lg font-bold rounded border-0 py-2 w-40 flex-grow-0 bg-red-100 hover:bg-red-200 focus:outline-none flex flex-auto items-center justify-center`}>
          { isGivingUp && <div className="animate-spin rounded-full border-solid border-red-200 border-l-red-400 group-hover:border-red-300 group-hover:border-l-red-500 border-4 h-6 w-6 mr-3 inline-block"></div> }
          { isGivingUp ? "Saving..." : "Give up" }
        </button>
      </div>
      <div className="mb-3">
        {wrongAnswer && <span><strong>{wrongAnswer}</strong> is incorrect!</span>}
      </div>
    </form>
    <CountdownTimer deadline={deadline} />
  </div>
}