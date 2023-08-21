import GoogleLoginButton from "@/components/google-login-button"
import type { InviteProps } from "./types"

// TODO: change to invite props
export default function InvalidEmail({
  invite,
  email,
}: {
  invite: InviteProps
  email: string
}) {
  const inviterName = invite.inviter.name;
  const collectionName = invite.collection.name;
  const emailDomain = invite.emailDomain;

  return (
    <div className="">
      {inviterName && <h1>{inviterName} invited you to {collectionName}!</h1>}
      <p>You must log in with an @{emailDomain} email. You are currently logged in as {email}.</p>
      <GoogleLoginButton />
    </div>
  );
}
