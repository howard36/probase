"use client";

import type { Props } from "./types";
import { useState } from "react";
import { editProblem } from "./actions";

export default function ArchiveToggle(props: Props) {
  const { problem } = props;
  const [isArchived, setArchived] = useState(problem.isArchived);
  const action = editProblem.bind(null, problem.id);

  const handleChange = async () => {
    const newIsArchived = !isArchived;
    setArchived(newIsArchived);
    await action({ isArchived: newIsArchived });
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isArchived}
        onChange={handleChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
      <span className="ms-3 text-sm font-medium text-slate-600">Archive</span>
    </label>
  );
}
