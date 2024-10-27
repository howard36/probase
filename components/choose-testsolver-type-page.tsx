"use client";

import { ActionResponse, wrapAction } from "@/lib/server-actions";
import { Collection, TestsolverType } from "@prisma/client";
import { useState } from "react";

export default function ChooseTestsolverTypePage({
  collection,
  submitAction,
}: {
  collection: Collection;
  submitAction: (
    collectionId: number,
    testsolverType: TestsolverType,
  ) => Promise<ActionResponse>;
}) {
  // TODO: rewrite as form with <select>
  const [testsolverType, setTestsolverType] = useState<TestsolverType | null>(
    null,
  );

  const action = wrapAction(submitAction);

  const confirmTestsolverType = () => {
    if (testsolverType !== null) {
      action(collection.id, testsolverType);
    }
  };

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mx-auto my-12 w-full max-w-[800px] sm:my-24">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Choose your testsolving style
        </h1>
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <div
            onClick={() => setTestsolverType(TestsolverType.Serious)}
            className={`w-full cursor-pointer rounded-xl border-2 bg-white p-4 text-gray-800 shadow-lg ${
              testsolverType === TestsolverType.Serious
                ? "border-violet-500 shadow-violet-500/30"
                : "border-white shadow-slate-500/20"
            }`}
          >
            <h3 className="mb-2 text-lg font-bold">Serious</h3>
            <ul className="ml-3 list-inside list-disc">
              <li>Practice with timed contest conditions</li>
              <li>Top 5 testsolvers featured on leaderboard</li>
              <li>Problems unlock when you start the timer</li>
            </ul>
          </div>
          <div
            onClick={() => setTestsolverType(TestsolverType.Casual)}
            className={`w-full cursor-pointer rounded-xl border-2 bg-white p-4 text-gray-800 shadow-lg ${
              testsolverType === TestsolverType.Casual
                ? "border-violet-500 shadow-violet-500/30"
                : "border-white shadow-slate-500/20"
            }`}
          >
            <h3 className="mb-2 text-lg font-bold">Casual</h3>
            <ul className="ml-3 list-inside list-disc">
              <li>No time limit</li>
              <li>Work on problems at your own pace</li>
              <li>All problems unlocked immediately</li>
            </ul>
          </div>
        </div>
        <p className="mb-6 text-slate-600">
          {`If you're not sure, pick Serious. It's more challenging, but provides accurate info on problem difficulty. You can always switch to Casual later.`}
        </p>
        <button
          onClick={confirmTestsolverType}
          className="rounded bg-violet-500 px-4 py-2 font-bold text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={testsolverType === null}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
