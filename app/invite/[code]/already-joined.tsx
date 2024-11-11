import { InviteProps } from "./types";
import Link from "next/link";

export default function AlreadyJoined({ invite }: { invite: InviteProps }) {
  const collectionName = invite.collection.name;

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mx-auto my-12 sm:my-24 sm:w-144">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Already Joined
        </h1>
        <p className="mb-16 text-xl">
          You already have access to{" "}
          <span className="font-bold text-slate-900">{collectionName}</span>.
        </p>
        <Link
          href={`/c/${invite.collection.cid}`}
          className="rounded bg-violet-500 px-4 py-2 font-bold text-white hover:bg-violet-600"
          prefetch={true}
        >
          Continue to {collectionName}
        </Link>
      </div>
    </div>
  );
}
