"use client";

import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { ProblemProps } from "./types";
import SubmitButton from "@/components/submit-button";
import { startTestsolve } from "./actions";
import { wrapAction } from "@/lib/server-actions";

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

  // TODO: replace router.refresh
  const tryStartTestsolving = wrapAction(startTestsolve, () =>
    router.refresh(),
  );

  return (
    <div>
      <div className="mb-24 mt-16 text-center text-lg sm:text-xl md:text-2xl">
        <FontAwesomeIcon icon={faLock} className="mr-2.5 text-slate-400" />
        <span className="font-semibold text-slate-500">Testsolve to view</span>
      </div>
      <div className="mb-8 space-y-6">
        <p>
          {`Once you start testsolving, you'll have `}
          <strong>{time}</strong>. Keep an eye on the clock!
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
      <form action={() => tryStartTestsolving(problem.id)}>
        <SubmitButton className="w-full">Start testsolving</SubmitButton>
      </form>
    </div>
  );
}
