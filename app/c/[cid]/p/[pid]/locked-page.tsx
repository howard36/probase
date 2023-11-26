'use client'

import { faLock } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRouter } from "next/navigation";
import { ProblemProps } from "./types";

export default function LockedPage({problem, time}: {problem: ProblemProps, time: string}) {
  const router = useRouter();

  const startTestsolving = async () => {
    await fetch(`/api/problems/${problem.id}/testsolve/start`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    router.refresh();
  };

  return <div>
    <div className="text-center text-lg sm:text-xl md:text-2xl mt-16 mb-24">
      <FontAwesomeIcon icon={faLock} className="text-slate-400 mr-2.5" />
      <span className="text-slate-500 font-semibold">Testsolve to view</span>
    </div>
    <div className="mb-8 space-y-4">
      <p>Once you start testsolving, you&apos;ll have <strong>{time}</strong>. Keep an eye on the clock!</p>
      <p>Speed and accuracy matter! A <strong>correct first submission</strong> can earn you a spot on the leaderboard.</p>
      <p>Best of luck!</p>
    </div>
    <button className="w-full py-3 px-10 text-center rounded-xl bg-blue-500 hover:bg-blue-600 text-slate-50 font-semibold text-xl soft-shadow-xl" onClick={startTestsolving}>
      Start Testsolving
    </button>
  </div>
}