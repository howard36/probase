"use client";

import ClickToEdit from "@/components/click-to-edit";
import type { SolutionProps } from "./types";
import { useRouter } from "next/navigation";
import { editSolution } from "./actions";
import { wrapAction } from "@/lib/server-actions";

export default function EditableSolution({
  solution,
  label,
}: {
  solution: SolutionProps;
  label: React.ReactNode;
}) {
  const router = useRouter();

  // TODO: useOptimistic instead of refreshing
  const tryEditSolution = wrapAction(editSolution, () => router.refresh());

  // const authorName = solution.authors[0].displayName;
  const saveSolution = (text: string) => {
    tryEditSolution(solution.id, text);
  };

  return (
    <ClickToEdit
      type="textarea"
      name="solution"
      label={label}
      initialText={solution.text}
      autosave={false}
      onSave={saveSolution}
      required={false}
    />
  );
}
