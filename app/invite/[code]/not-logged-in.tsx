import GoogleLoginButton from "@/components/google-login-button";
import type { InviteProps } from "./types";

export default function NotLoggedIn({ invite }: { invite: InviteProps }) {
  const inviterName = invite.inviter.name;
  const collectionName = invite.collection.name;

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mx-auto my-12 sm:my-24 sm:w-144">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          {inviterName} invited you!
        </h1>
        <p className="mb-16 text-xl">
          Log in to Probase to join{" "}
          <span className="font-bold text-slate-900">{collectionName}</span>
        </p>
        <GoogleLoginButton />
      </div>
    </div>
  );
}
