import { wrapAction } from "@/lib/server-actions";
import { Collection } from "@prisma/client";
import { useState } from "react";

export default function ChooseTestsolverTypePage({
  collection,
}: {
  collection: Collection;
}) {
  const [testsolveType, setTestsolveType] = useState<
    "serious" | "casual" | null
  >(null);
  const action = wrapAction(setTestsolverType);

  const handleAcceptInvite = () => {
    const formData = new FormData();
    formData.append("testsolveType", testsolveType || "casual");
    action(collection.id, formData);
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
              onClick={() => setTestsolveType("serious")}
              className={`py-2 px-4 rounded ${
                testsolveType === "serious"
                  ? "bg-violet-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Serious
            </button>
            <button
              onClick={() => setTestsolveType("casual")}
              className={`py-2 px-4 rounded ${
                testsolveType === "casual"
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
