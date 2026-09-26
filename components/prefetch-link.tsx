"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";

/**
 * A link to a page that must open instantly but show current data. Its page
 * is prefetched in full when the link comes into view, and prefetched again
 * when the pointer, a touch or keyboard focus reaches the link if that copy
 * is older than the 30 seconds `staleTimes.static` allows (next.config.js).
 * Next.js itself covers view, hover and touch; focus is added here.
 */
export default function PrefetchLink({
  href,
  onFocus,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "prefetch" | "href"> & {
  href: string;
}) {
  const router = useRouter();
  return (
    <Link
      {...props}
      href={href}
      prefetch={true}
      onFocus={(event) => {
        onFocus?.(event);
        router.prefetch(href, { kind: PrefetchKind.FULL });
      }}
    />
  );
}
