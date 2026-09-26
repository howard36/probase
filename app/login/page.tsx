import { redirect } from "next/navigation";
import GoogleLoginButton from "@/components/google-login-button";
import { getCurrentUser } from "@/lib/current-user";

interface SearchParams {
  callbackUrl?: string | string[];
}

// Stands in for this site's origin when resolving a callback path.
const SAME_SITE = "https://probase.invalid";

/**
 * `value` resolved the way a browser resolves it, if that stays on this site;
 * otherwise null. Browsers drop tabs and newlines and read "\" as "/", so
 * "/<tab>/host" and "/\host" both lead to "host".
 */
function sameSitePath(value: string): string | null {
  if (!value.startsWith("/")) {
    return null;
  }
  // `URL.parse` returns null for what cannot be parsed, such as "//[".
  const url = URL.parse(value, SAME_SITE);
  if (url === null || url.origin !== SAME_SITE) {
    return null;
  }
  return url.pathname + url.search + url.hash;
}

/**
 * The path to return to after signing in. Only a same-site path is honoured,
 * so a crafted link cannot bounce a visitor to another site.
 */
function safeCallbackPath(callbackUrl: string | string[] | undefined): string {
  const value = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;
  const path = value === undefined ? null : sameSitePath(value);
  // Resolving can itself produce "//host" (from "/.//host"), so the resolved
  // path must pass again, unchanged.
  return path !== null && sameSitePath(path) === path ? path : "/";
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
