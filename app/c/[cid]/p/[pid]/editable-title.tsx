"use client"

import ClickToEdit from "@/components/click-to-edit";
import type { Problem } from "@prisma/client";
import { editProblem } from "./actions";

export default function EditableTitle({ problem }: { problem: Problem }) {
  const action = editProblem.bind(null, problem.id);

  const saveTitle = async (text: string) => {
    await action({ title: text });
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
