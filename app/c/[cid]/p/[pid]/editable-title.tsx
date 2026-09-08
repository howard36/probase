"use client";

import ClickToEdit from "@/components/click-to-edit";
import { editProblem } from "./actions";
import { runAction } from "@/lib/server-actions";

export default function EditableTitle({
  problem,
}: {
  problem: { id: number; title: string };
}) {
  const saveTitle = async (text: string) => {
    const resp = await runAction(editProblem)(problem.id, { title: text });
    return resp?.ok ?? false;
  };

  return (
    <ClickToEdit
      type="input"
      name="title"
      initialText={problem.title}
      autosave={true}
      onSave={saveTitle}
      required={false}
    />
  );
}
