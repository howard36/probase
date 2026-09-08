"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto my-24 w-128 max-w-full px-8 text-slate-800">
      <h1 className="mb-8 text-3xl">Something went wrong</h1>
      <p className="mb-8 text-xl">
        An unexpected error occurred while loading this page.
      </p>
      <button
        onClick={reset}
        className="rounded bg-violet-500 px-4 py-2 font-bold text-white hover:bg-violet-600"
      >
        Try again
      </button>
    </div>
  );
}
