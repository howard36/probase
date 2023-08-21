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
    <div className="">
      {inviterName && <h1>{inviterName} invited you to {collectionName}!</h1>}
      <p>Log in to Probase to accept the invite</p>
      <GoogleLoginButton />
    </div>
  );
}
