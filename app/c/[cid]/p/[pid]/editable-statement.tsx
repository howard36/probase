"use client";

import ClickToEdit from "@/components/click-to-edit";
import type { Problem } from "@prisma/client";
import { editProblem } from "./actions";
import { wrapAction } from "@/lib/server-actions";

export default function EditableStatement({ problem }: { problem: Problem }) {
  const saveStatement = (text: string) => {
    wrapAction(editProblem)(problem.id, { statement: text });
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
