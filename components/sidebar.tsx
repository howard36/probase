"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // TODO: automate links based on permissions
  // TODO: collection name might be too long, needs cutoff
  // TODO: collection list might be too long, needs vertical scroll
  const links = [
    {
      href: "/c/demo",
      label: "Demo",
      active: pathname !== null && pathname.startsWith("/c/demo"),
    },
    {
      href: "/c/cmimc",
      label: "CMIMC",
      active: pathname !== null && pathname.startsWith("/c/cmimc"),
    },
    {
      href: "/c/otis-mock-aime",
      label: "OTIS Mock AIME",
      active: pathname !== null && pathname.startsWith("/c/otis-mock-aime"),
    },
  ];

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
              <Link
                key={href}
                href={href}
                prefetch={true}
                className={`my-2 flex items-center rounded-lg px-3 py-3 sm:px-6 ${
                  active
                    ? "bg-slate-100 text-slate-700"
                    : "text-slate-600 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="ml-40 sm:ml-64">{children}</div>
    </>
  );
}
