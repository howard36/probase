"use client";

import ClickToEdit from "@/components/click-to-edit";
import type { Problem } from "@prisma/client";
import { editProblem } from "./actions";
import { runAction } from "@/lib/server-actions";

export default function EditableAnswer({
  problem,
  label,
}: {
  problem: Problem;
  label: React.ReactNode;
}) {
  const saveAnswer = async (text: string) => {
    const resp = await runAction(editProblem)(problem.id, { answer: text });
    return resp?.ok ?? false;
  };

  if (problem.answer === null) {
    throw new Error(
      "problem.answer is null, EditableAnswer shouldn't even render",
    );
  }

  return (
    <ClickToEdit
      type="input"
      name="answer"
      label={label}
      initialText={problem.answer}
      autosave={true}
      onSave={saveAnswer}
      required={false}
    />
  );
}
