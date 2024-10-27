"use client";

import type { Props } from "./types";
import { useState } from "react";
import { editProblem } from "./actions";
import { wrapAction } from "@/lib/server-actions";

export default function ArchiveToggle(props: Props) {
  const { problem } = props;
  const [isArchived, setArchived] = useState(problem.isArchived);

  const handleChange = () => {
    const newIsArchived = !isArchived;
    setArchived(newIsArchived);
    wrapAction(editProblem)(problem.id, { isArchived: newIsArchived });
  };

  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={isArchived}
        onChange={handleChange}
        className="peer sr-only"
      />
      <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-violet-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-200 rtl:peer-checked:after:-translate-x-full"></div>
      <span className="ms-3 text-sm font-medium text-slate-600">Archive</span>
    </label>
  );
}
