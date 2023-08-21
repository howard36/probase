import GoogleLoginButton from "@/components/google-login-button"
import type { InviteProps } from "./types"

export default function NotLoggedIn({
  invite
}: {
  invite: InviteProps
}) {
  const inviterName = invite.inviter.name;
  const collectionName = invite.collection.name;

  return (
    <div className="p-8 text-slate-800">
      <div className="sm:w-128 mx-auto my-24">
        {inviterName && <h1 className="text-3xl mb-6 font-bold text-slate-900">{inviterName} invited you!</h1>}
        <p className="text-xl mb-16">Log in to Probase to join <span className="font-bold text-slate-900">{collectionName}</span></p>
        <GoogleLoginButton />
      </div>
    </div>
  );
}
