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
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mx-auto my-12 sm:my-24 sm:w-144">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          {inviterName} invited you!
        </h1>
        <p className="mb-6 text-xl">
          Log in with an{" "}
          <span className="font-bold text-slate-900">@{emailDomain}</span> email
          to join{" "}
          <span className="font-bold text-slate-900">{collectionName}</span>
        </p>
        <p className="mb-16 text-xl">
          Currently logged in as{" "}
          <span className="font-bold text-slate-900">{email}</span>
        </p>
        <GoogleLoginButton />
      </div>
    </div>
  );
}
