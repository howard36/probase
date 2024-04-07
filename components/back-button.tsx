"use client"

import Link from "next/link";

export default function BackButton({ href, label }: { href: string, label: string }) {
  return (
    <Link
      href={href}
      prefetch={true}
      className="text-slate-600 hover:text-slate-800 underline flex items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
      <span className="ml-1">{label}</span>
    </Link>
  )
}
