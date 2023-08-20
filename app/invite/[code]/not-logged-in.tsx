import GoogleLoginButton from "@/components/google-login-button"

export default function NotLoggedIn({
  inviterName
}: {
  inviterName: string | null
}) {
  return (
    <div className="">
      {inviterName && <h1>{inviterName} invited you!</h1>}
      <p>Log in to Probase to accept the invite</p>
      <GoogleLoginButton />
    </div>
  );
}
