import GoogleLoginButton from "@/components/google-login-button";
import type { InviteProps } from "./types";

export default function Expired({ invite }: { invite: InviteProps }) {
  const inviterName = invite.inviter.name;
  const collectionName = invite.collection.name;

  return (
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="sm:w-144 mx-auto my-12 sm:my-24">
        <h1 className="text-3xl mb-6 font-bold text-slate-900">
          Invite Expired
        </h1>
        <p className="text-xl mb-16">
          This invite link has expired. If you think this is a mistake, contact{" "}
          <span className="font-bold text-slate-900">{inviterName}</span> for
          access to <span>{collectionName}</span>.
        </p>
        <GoogleLoginButton />
      </div>
    </div>
  );
}
