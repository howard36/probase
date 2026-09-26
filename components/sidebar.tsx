"use client";

import PrefetchLink from "@/components/prefetch-link";
import { usePathname } from "next/navigation";
import { SIDEBAR_COLLECTIONS } from "@/lib/collection-config";
import { SignOutButton } from "./account-buttons";

export default function Sidebar({
  signedInAs,
  children,
}: {
  /** The signed-in user's email, or null when signed out. */
  signedInAs: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // TODO: automate links based on permissions
  // TODO: collection name might be too long, needs cutoff
  // TODO: collection list might be too long, needs vertical scroll
  const links = SIDEBAR_COLLECTIONS.map(({ cid, name }) => ({
    href: `/c/${cid}`,
    label: name,
    active: pathname !== null && pathname.startsWith(`/c/${cid}`),
  }));

  return (
    <>
      <div
        className="soft-shadow-r-lg fixed left-0 top-0 flex h-screen w-40 flex-col overflow-y-auto bg-white p-4 pt-12 sm:w-64 sm:p-6"
        aria-label="Sidenav"
      >
        <h2 className="mb-4 px-3 text-2xl font-bold text-slate-900 sm:text-center sm:text-3xl">
          Probase
        </h2>

        <div className="flex flex-1 flex-col justify-between">
          <nav>
            {links.map(({ href, label, active }) => (
              <PrefetchLink
                key={href}
                href={href}
                className={`my-2 flex items-center rounded-lg px-3 py-3 sm:px-6 ${
                  active
                    ? "bg-slate-100 text-slate-700"
                    : "text-slate-600 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span className="font-medium">{label}</span>
              </PrefetchLink>
            ))}
          </nav>
          {signedInAs !== null && (
            <div className="mt-8 break-words px-3 text-sm text-slate-500">
              <p className="mb-1">Signed in as {signedInAs}</p>
              <SignOutButton />
            </div>
          )}
        </div>
      </div>
      <div className="ml-40 sm:ml-64">{children}</div>
    </>
  );
}
