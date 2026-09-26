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
export function safeCallbackPath(
  callbackUrl: string | string[] | undefined,
): string {
  const value = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;
  const path = value === undefined ? null : sameSitePath(value);
  // Resolving can itself produce "//host" (from "/.//host"), so the resolved
  // path must pass again, unchanged.
  return path !== null && sameSitePath(path) === path ? path : "/";
}
