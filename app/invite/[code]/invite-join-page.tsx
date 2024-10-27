"use client";

import { InviteProps } from "./types";
import { wrapAction } from "@/lib/server-actions";
import { acceptInvite } from "./actions";

export default function InviteJoinPage({ invite }: { invite: InviteProps }) {
  const action = wrapAction(acceptInvite);
  const inviterName = invite.inviter.name;
  const collectionName = invite.collection.name;

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mx-auto my-12 sm:my-24 sm:w-144">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          {inviterName} invited you!
        </h1>
        <p className="mb-16 text-xl">
          {`You've been invited to join `}
          <span className="font-bold">{collectionName}</span>.
        </p>
        <button
          onClick={() => action(invite.code)}
          className="rounded bg-violet-500 px-4 py-2 font-bold text-white hover:bg-violet-600"
        >
          Accept Invite
        </button>
      </div>
    </div>
  );
}
