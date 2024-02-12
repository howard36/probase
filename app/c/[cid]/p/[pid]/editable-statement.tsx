"use client";

import ClickToEdit from "@/components/click-to-edit";
import type { Problem } from "@prisma/client";
import { editProblem } from "./actions";

export default function EditableStatement({ problem }: { problem: Problem }) {
  const action = editProblem.bind(null, problem.id);

  const saveStatement = async (text: string) => {
    await action({ statement: text });
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
