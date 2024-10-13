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
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="w-full max-w-[800px] mx-auto my-12 sm:my-24">
        <h1 className="text-3xl mb-8 font-bold text-slate-900">
          Choose your testsolving style
        </h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div
            onClick={() => setTestsolverType(TestsolverType.Serious)}
            className={`w-full p-4 rounded-xl cursor-pointer bg-white text-gray-800 shadow-lg border-2 ${
              testsolverType === TestsolverType.Serious
                ? "border-violet-500 shadow-violet-500/30"
                : "border-white shadow-slate-500/20"
            }`}
          >
            <h3 className="text-lg font-bold mb-2">Serious</h3>
            <ul className="ml-3 list-disc list-inside">
              <li>Practice with timed contest conditions</li>
              <li>Top 3 featured on leaderboard</li>
              <li>Problems unlock when you start the timer</li>
            </ul>
          </div>
          <div
            onClick={() => setTestsolverType(TestsolverType.Casual)}
            className={`w-full p-4 rounded-xl cursor-pointer bg-white text-gray-800 shadow-lg border-2 ${
              testsolverType === TestsolverType.Casual
                ? "border-violet-500 shadow-violet-500/30"
                : "border-white shadow-slate-500/20"
            }`}
          >
            <h3 className="text-lg font-bold mb-2">Casual</h3>
            <ul className="ml-3 list-disc list-inside">
              <li>No time limit</li>
              <li>Work on problems at your own pace</li>
              <li>All problems unlocked immediately</li>
            </ul>
          </div>
        </div>
        <p className="mb-6 text-slate-600">
          If you're not sure, pick Serious. It's more challenging, but provides
          accurate info on problem difficulty. You can always switch to Casual
          later.
        </p>
        <button
          onClick={confirmTestsolverType}
          className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
