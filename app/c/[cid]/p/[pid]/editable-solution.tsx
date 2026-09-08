"use client";

import ClickToEdit from "@/components/click-to-edit";
import type { SolutionProps } from "./types";
import { useRouter } from "next/navigation";
import { editSolution } from "./actions";
import { runAction } from "@/lib/server-actions";

export default function EditableSolution({
  solution,
  label,
}: {
  solution: SolutionProps;
  label: React.ReactNode;
}) {
  const router = useRouter();

  // TODO: useOptimistic instead of refreshing
  const saveSolution = async (text: string) => {
    const resp = await runAction(editSolution)(solution.id, text);
    const saved = resp?.ok ?? false;
    if (saved) {
      router.refresh();
    }
    return saved;
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
