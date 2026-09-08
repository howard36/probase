"use client";

import ClickToEdit from "@/components/click-to-edit";
import { editProblem } from "./actions";
import { runAction } from "@/lib/server-actions";

export default function EditableStatement({
  problem,
}: {
  problem: { id: number; statement: string };
}) {
  const saveStatement = async (text: string) => {
    const resp = await runAction(editProblem)(problem.id, { statement: text });
    return resp?.ok ?? false;
  };

  return (
    <ClickToEdit
      type="textarea"
      name="statement"
      initialText={problem.statement}
      autosave={false}
      onSave={saveStatement}
      required={false}
    />
  );
}
