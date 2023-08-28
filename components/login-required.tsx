import GoogleLoginButton from "@/components/google-login-button"

export default function LoginRequired({
  message,
  callbackUrl,
}: {
  message: string
  callbackUrl: string
}) {
  return (
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="sm:w-144 mx-auto my-12 sm:my-24">
        <h1 className="text-3xl mb-6 font-bold text-slate-900">Login Required</h1>
        <p className="text-xl mb-16">{message}</p>
        <GoogleLoginButton callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
