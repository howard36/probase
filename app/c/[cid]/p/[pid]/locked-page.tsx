"use client";

import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { ProblemProps } from "./types";
import SubmitButton from "@/components/submit-button";
import { useState } from "react";
import { startTestsolve } from "./actions";

export default function LockedPage({
  problem,
  time,
  unsolved,
}: {
  problem: ProblemProps;
  time: string;
  unsolved: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTestsolving = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const resp = await startTestsolve(problem.id);

    if (resp.ok) {
      router.refresh();
      setIsSubmitting(false);
    } else if ("error" in resp) {
      console.error(resp.error.message);
    }
  };

  return (
    <div>
      <div className="text-center text-lg sm:text-xl md:text-2xl mt-16 mb-24">
        <FontAwesomeIcon icon={faLock} className="text-slate-400 mr-2.5" />
        <span className="text-slate-500 font-semibold">Testsolve to view</span>
      </div>
      <div className="mb-8 space-y-6">
        <p>
          Once you start testsolving, you&apos;ll have <strong>{time}</strong>.
          Keep an eye on the clock!
        </p>
        <p>
          Speed and accuracy matter! A <strong>correct first submission</strong>{" "}
          can earn you a spot on the leaderboard.
        </p>
        {unsolved && (
          <p>
            No one has solved this problem yet&mdash;
            <strong>You could be the first!</strong>
          </p>
        )}
        <p>Best of luck!</p>
      </div>
      <form onSubmit={startTestsolving}>
        <SubmitButton isSubmitting={isSubmitting} className="w-full">
          Start testsolving
        </SubmitButton>
      </form>
    </div>
  );
}
