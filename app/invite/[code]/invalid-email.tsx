import GoogleLoginButton from "@/components/google-login-button"

// TODO: change to invite props
export default function InvalidEmail({
  inviterName,
  collectionName,
  email,
  emailDomain
}: {
  inviterName: string | null
  collectionName: string
  email: string
  emailDomain: string
}) {
  return (
    <div className="">
      {inviterName && <h1>{inviterName} invited you to {collectionName}!</h1>}
      <p>You must log in with an @{emailDomain} email. You are currently logged in as {email}.</p>
      <GoogleLoginButton />
    </div>
  );
}
