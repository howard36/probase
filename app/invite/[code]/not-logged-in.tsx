import GoogleLoginButton from "@/components/google-login-button"

export default function NotLoggedIn({
  inviterName,
  collectionName,
}: {
  inviterName: string | null
  collectionName: string
}) {
  return (
    <div className="">
      {inviterName && <h1>{inviterName} invited you to {collectionName}!</h1>}
      <p>Log in to Probase to accept the invite</p>
      <GoogleLoginButton />
    </div>
  );
}
