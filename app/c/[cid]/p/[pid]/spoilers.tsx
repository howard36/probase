"use client";

import { useId, useState } from "react";

/**
 * Hides its children (the answer and solution, rendered by the server) behind
 * a "Show spoilers" button. This is a courtesy for readers, not an access
 * control: the page only renders spoilers for users allowed to see them.
 * The children mount when first shown (an empty answer's editor takes focus
 * then) and stay mounted when hidden again, so a draft typed in an editor
 * inside is still there when the spoilers are shown again.
 */
export default function Spoilers({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(true);
  const [shown, setShown] = useState(false);
  const contentId = useId();

  return (
    <div className="my-12">
      <button
        onClick={() => {
          setHidden(!hidden);
          setShown(true);
        }}
        aria-expanded={!hidden}
        aria-controls={contentId}
        className="w-44 rounded-md bg-violet-500 py-4 text-base font-semibold leading-none text-slate-50 hover:bg-violet-600"
      >
        {hidden ? "Show spoilers" : "Hide spoilers"}
      </button>
      <div id={contentId} hidden={hidden}>
        {shown && children}
      </div>
    </div>
  );
}
