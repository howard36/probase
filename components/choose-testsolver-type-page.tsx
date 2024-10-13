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

  const handleAcceptInvite = () => {
    if (testsolverType !== null) {
      action(collection.id, testsolverType);
    }
  };

  return (
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="sm:w-144 mx-auto my-12 sm:my-24">
        <h1 className="text-3xl mb-6 font-bold text-slate-900">
          Choose your testsolving preference
        </h1>
        <p className="text-xl mb-8">
          You&apos;ve been invited to join{" "}
          <span className="font-bold">{collection.name}</span>.
        </p>
        <div className="mb-8">
          <p className="mb-4">
            This collection requires testsolving. Please choose your testsolving
            preference:
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setTestsolverType(TestsolverType.Serious)}
              className={`py-2 px-4 rounded ${
                testsolverType === TestsolverType.Serious
                  ? "bg-violet-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Serious
            </button>
            <button
              onClick={() => setTestsolverType(TestsolverType.Casual)}
              className={`py-2 px-4 rounded ${
                testsolverType === TestsolverType.Casual
                  ? "bg-violet-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Casual
            </button>
          </div>
        </div>
        <button
          onClick={handleAcceptInvite}
          className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded"
        >
          Accept Invite
        </button>
      </div>
    </div>
  );
}
