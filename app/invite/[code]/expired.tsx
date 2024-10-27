import type { InviteProps } from "./types";

export default function Expired({ invite }: { invite: InviteProps }) {
  const inviterName = invite.inviter.name;
  const collectionName = invite.collection.name;

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mx-auto my-12 sm:my-24 sm:w-144">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Invite Expired
        </h1>
        <p className="mb-16 text-xl">
          This invite link has expired. If you think this is a mistake, contact{" "}
          <span className="font-bold text-slate-900">{inviterName}</span> for
          access to <span>{collectionName}</span>.
        </p>
      </div>
    </div>
  );
}
