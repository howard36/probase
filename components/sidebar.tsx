'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  // TODO: automate links based on permissions
  // TODO: collection name might be too long, needs cutoff
  // TODO: collection list might be too long, needs vertical scroll
  const links = [
    { href: '/c/demo', label: 'Demo', active: (pathname !== null) && pathname.startsWith('/c/demo') },
    { href: '/c/cmimc', label: 'CMIMC', active: (pathname !== null) && pathname.startsWith('/c/cmimc') },
    { href: '/c/otis-mock-aime', label: 'OTIS Mock AIME', active: (pathname !== null) && pathname.startsWith('/c/otis-mock-aime') },
  ];

  return (
    <>
      <div className="fixed w-64 left-0 top-0 h-screen flex flex-col px-6 py-6 bg-white overflow-y-auto soft-shadow-r-lg" aria-label="Sidenav">
        <h2 className="text-3xl font-bold text-center text-slate-900 mt-8 mb-4">Probase</h2>
        
        <div className="flex flex-col justify-between flex-1">
          <nav>
            {links.map(({ href, label, active }) => (
              <Link key={href} href={href} prefetch={true} className={`flex items-center p-3 px-6 my-2 rounded-lg ${active ? "bg-slate-100 text-slate-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-300"}`}>
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="ml-64">
        {children}
      </div>
    </>
  );
}
