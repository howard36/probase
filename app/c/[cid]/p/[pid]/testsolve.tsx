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

  const handleSubmit = async (e: React.FormEvent) => {
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
    setSubmitting(false);
  };

  return <div>
    <form onSubmit={handleSubmit} className="mb-8">
      <Label text="ANSWER" />
      <div className="mb-4">
        <AimeInput value={answer} onValueChange={(newValue: string) => setAnswer(newValue)} required />
      </div>
      <div className="flex gap-x-6 items-center">
        {/* TODO: make this a component */}
        <button disabled={isSubmitting || answer === ''} className={`text-white text-lg font-bold rounded border-0 py-2 w-40 flex-grow-0 ${answer === '' ? "bg-slate-300" : "bg-blue-500 hover:bg-blue-600"} focus:outline-none flex flex-auto items-center justify-center`}>
          { isSubmitting && <div className="animate-spin rounded-full border-solid border-blue-400 border-l-blue-50 border-4 h-6 w-6 mr-3 inline-block"></div> }
          { isSubmitting ? "Saving..." : "Submit" }
        </button>
        {wrongAnswer && <span><strong>{wrongAnswer}</strong> is incorrect!</span>}
      </div>
    </form>
    <CountdownTimer deadline={deadline} />
  </div>
}