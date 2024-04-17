"use client";

import ClickToEdit from "@/components/click-to-edit";
import type { Problem } from "@prisma/client";
import { editProblem } from "./actions";
import { wrapAction } from "@/lib/server-actions";

export default function EditableTitle({ problem }: { problem: Problem }) {
  const saveTitle = (text: string) => {
    wrapAction(editProblem)(problem.id, { title: text });
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
