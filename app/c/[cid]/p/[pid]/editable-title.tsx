"use client";

import ClickToEdit from "@/components/click-to-edit";
import type { Problem } from "@prisma/client";
import { editProblem } from "./actions";
import { runAction } from "@/lib/server-actions";

export default function EditableTitle({ problem }: { problem: Problem }) {
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
