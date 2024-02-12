"use client";

import ClickToEdit from "@/components/click-to-edit";
import type { SolutionProps } from "./types";
import { useRouter } from "next/navigation";
import { editSolution } from "./actions";

export default function EditableSolution({
  solution,
  label,
}: {
  solution: SolutionProps;
  label: React.ReactNode;
}) {
  const router = useRouter();

  // const authorName = solution.authors[0].displayName;
  const saveSolution = async (text: string) => {
    const resp = await editSolution(solution.id, text);
    if (resp.ok) {
      router.refresh();
    } else {
      console.error(`updating failed!`);
    }
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
