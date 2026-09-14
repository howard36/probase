import { redirect } from "next/navigation";
import GoogleLoginButton from "@/components/google-login-button";
import { getCurrentUser } from "@/lib/current-user";

interface SearchParams {
  callbackUrl?: string | string[];
}

/**
 * The path to return to after signing in. Only a same-site path is honoured,
 * so a crafted link cannot bounce a visitor to another site: it must start
 * with a single "/" ("//host" is protocol-relative, and browsers read "/\host"
 * the same way).
 */
function safeCallbackPath(callbackUrl: string | string[] | undefined): string {
  const value = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;
  if (value === undefined || !/^\/(?![/\\])/.test(value)) {
    return "/";
  }
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { callbackUrl } = await searchParams;
  const callbackPath = safeCallbackPath(callbackUrl);

  const user = await getCurrentUser();
  if (user !== null) {
    redirect(callbackPath);
  }

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mx-auto my-12 sm:my-24 sm:w-144">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Log in to Probase
        </h1>
        <p className="mb-16 text-xl">
          Log in with your Google account to continue.
        </p>
        <GoogleLoginButton callbackUrl={callbackPath} />
      </div>
    </div>
  );
}
