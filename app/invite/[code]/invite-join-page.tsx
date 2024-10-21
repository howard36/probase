"use client";

import { InviteProps } from "./types";
import { wrapAction } from "@/lib/server-actions";
import { acceptInvite } from "./actions";

export default function InviteJoinPage({ invite }: { invite: InviteProps }) {
  const action = wrapAction(acceptInvite);
  const inviterName = invite.inviter.name;
  const collectionName = invite.collection.name;

  return (
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="sm:w-144 mx-auto my-12 sm:my-24">
        <h1 className="text-3xl mb-6 font-bold text-slate-900">
          {inviterName} invited you!
        </h1>
        <p className="text-xl mb-16">
          {`You've been invited to join `}
          <span className="font-bold">{collectionName}</span>.
        </p>
        <button
          onClick={() => action(invite.code)}
          className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded"
        >
          Accept Invite
        </button>
      </div>
    </div>
  );
}
