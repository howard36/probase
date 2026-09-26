"use client";

import { ActionResponse, wrapAction } from "@/lib/server-actions";
import { cn } from "@/lib/utils";
import { Collection, TestsolverType } from "@prisma/client";
import { useState } from "react";

const choices = [
  {
    type: TestsolverType.Serious,
    points: [
      "Practice with timed contest conditions",
      "Top 5 testsolvers featured on leaderboard",
      "Problems unlock when you start the timer",
    ],
  },
  {
    type: TestsolverType.Casual,
    points: [
      "No time limit",
      "Work on problems at your own pace",
      "All problems unlocked immediately",
    ],
  },
];

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
  const [testsolverType, setTestsolverType] = useState<TestsolverType | null>(
    null,
  );

  const action = wrapAction(submitAction);

  const confirmTestsolverType = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (testsolverType !== null) {
      action(collection.id, testsolverType);
    }
  };

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <form
        onSubmit={confirmTestsolverType}
        className="mx-auto my-12 w-full max-w-[800px] sm:my-24"
      >
        <h1
          id="testsolver-type-heading"
          className="mb-8 text-3xl font-bold text-slate-900"
        >
          Choose your testsolving style
        </h1>
        {/* Each card is a radio button, so the choice can be made with Tab
            and the arrow keys as well as by clicking anywhere on a card. */}
        <div
          role="radiogroup"
          aria-labelledby="testsolver-type-heading"
          className="mb-8 flex flex-col gap-4 md:flex-row"
        >
          {choices.map(({ type, points }) => (
            <div
              key={type}
              onClick={() => setTestsolverType(type)}
              className={cn(
                "relative w-full cursor-pointer rounded-xl border-2 bg-white p-4 text-gray-800 shadow-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-300 has-[:focus-visible]:ring-offset-2",
                testsolverType === type
                  ? "border-violet-500 shadow-violet-500/30"
                  : "border-white shadow-slate-500/20",
              )}
            >
              <input
                type="radio"
                id={`testsolver-type-${type}`}
                name="testsolverType"
                value={type}
                checked={testsolverType === type}
                onChange={() => setTestsolverType(type)}
                aria-describedby={`testsolver-type-${type}-points`}
                className="sr-only"
              />
              <h3 className="mb-2 text-lg font-bold">
                <label
                  htmlFor={`testsolver-type-${type}`}
                  className="cursor-pointer"
                >
                  {type}
                </label>
              </h3>
              <ul
                id={`testsolver-type-${type}-points`}
                className="ml-3 list-inside list-disc"
              >
                {points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mb-6 text-slate-600">
          {`If you're not sure, pick Serious. It's more challenging, but provides accurate info on problem difficulty. You can always switch to Casual later.`}
        </p>
        <button
          type="submit"
          className="rounded bg-violet-500 px-4 py-2 font-bold text-white hover:bg-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={testsolverType === null}
        >
          Confirm
        </button>
      </form>
    </div>
  );
}
