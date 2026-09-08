"use client";

import { useState } from "react";

/**
 * Hides its children (the answer and solution, rendered by the server) behind
 * a "Show spoilers" button. This is a courtesy for readers, not an access
 * control: the page only renders spoilers for users allowed to see them.
 */
export default function Spoilers({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(true);

  return (
    <div className="my-12">
      <button
        onClick={() => setHidden(!hidden)}
        className="w-44 rounded-md bg-violet-500 py-4 text-base font-semibold leading-none text-slate-50 hover:bg-violet-600"
      >
        {hidden ? "Show spoilers" : "Hide spoilers"}
      </button>
      {!hidden && children}
    </div>
  );
}
