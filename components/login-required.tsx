import GoogleLoginButton from "@/components/google-login-button";

export default function LoginRequired({
  message,
  callbackUrl,
}: {
  message: string;
  callbackUrl: string;
}) {
  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mx-auto my-12 sm:my-24 sm:w-144">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Login Required
        </h1>
        <p className="mb-16 text-xl">{message}</p>
        <GoogleLoginButton callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
