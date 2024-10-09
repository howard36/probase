import { InviteProps } from "./types";
import Link from "next/link";

export default function AlreadyJoined({ invite }: { invite: InviteProps }) {
  const inviterName = invite.inviter.name;
  const collectionName = invite.collection.name;

  return (
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="sm:w-144 mx-auto my-12 sm:my-24">
        <h1 className="text-3xl mb-6 font-bold text-slate-900">
          Already Joined
        </h1>
        <p className="text-xl mb-16">
          You already have access to{" "}
          <span className="font-bold text-slate-900">{collectionName}</span>.
        </p>
        <Link
          href={`/c/${invite.collection.cid}`}
          className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded"
        >
          Continue to {collectionName}
        </Link>
      </div>
    </div>
  );
}
