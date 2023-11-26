'use client'

import { faLock } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRouter } from "next/navigation";
import { ProblemProps } from "./types";

export default async function LockedPage({problem, time}: {problem: ProblemProps, time: string}) {
  const router = useRouter();

  const startTestsolving = async () => {
    await fetch(`/api/solve-attempts/add`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
      }),
    });
    router.refresh();
  };

  return <div>
    <div className="text-center text-lg sm:text-xl md:text-2xl mt-12 mb-20">
      <FontAwesomeIcon icon={faLock} className="text-slate-400 mr-2.5" />
      <span className="text-slate-500 font-semibold">Testsolve to view</span>
    </div>
    <div className="mt-12 mb-6 py-3 px-10 text-center rounded-xl bg-blue-500 hover:bg-blue-600 text-slate-50 font-semibold text-xl soft-shadow-xl" onClick={startTestsolving}>
      Start Testsolving
    </div>
    <div>
      Once you start, you will have <strong>{time}</strong> to solve the problem.
    </div>
  </div>
}