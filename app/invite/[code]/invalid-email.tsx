import GoogleLoginButton from "@/components/google-login-button";
import type { InviteProps } from "./types";

// TODO: change to invite props
export default function InvalidEmail({
  invite,
  email,
}: {
  invite: InviteProps;
  email: string;
}) {
  const inviterName = invite.inviter.name;
  const collectionName = invite.collection.name;
  const emailDomain = invite.emailDomain;

  return (
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="sm:w-144 mx-auto my-12 sm:my-24">
        <h1 className="text-3xl mb-6 font-bold text-slate-900">
          {inviterName} invited you!
        </h1>
        <p className="text-xl mb-6">
          Log in with an{" "}
          <span className="font-bold text-slate-900">@{emailDomain}</span> email
          to join{" "}
          <span className="font-bold text-slate-900">{collectionName}</span>
        </p>
        <p className="text-xl mb-16">
          Currently logged in as{" "}
          <span className="font-bold text-slate-900">{email}</span>
        </p>
        <GoogleLoginButton />
      </div>
    </div>
  );
}
