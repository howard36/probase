// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { useSession } from 'next-auth/react';
// import { ReactNode } from 'react';

// export default function Header({
//   children
// }: {
//   children: ReactNode
// }) {
//   const { asPath } = useRouter();
//   const session = useSession();

//   return (
//     <>
//       <header className="fixed h-16 left-0 top-0 h-screen flex flex-col px-6 py-6 bg-white overflow-y-auto soft-shadow-r-lg" aria-label="Sidenav">
//         <h2 className="text-3xl font-bold text-center text-slate-900 mt-8 mb-4">Probase</h2>

//         <div className="flex flex-col justify-between flex-1">
//           <nav>
//             {links.map(({ href, label, active }) => (
//               <Link key={href} href={href} className={`flex items-center p-3 px-6 my-2 rounded-lg ${active ? "bg-slate-100 text-slate-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-300"}`}>
//                 <span className="font-medium">{label}</span>
//               </Link>
//             ))}
//           </nav>
//         </div>
//       </header>
//       <div className="mt-16">
//         {children}
//       </div>
//     </>
//   );
// }

export {};
