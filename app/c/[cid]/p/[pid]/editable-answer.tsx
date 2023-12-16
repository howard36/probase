"use client";

import ClickToEdit from "@/components/click-to-edit";
import type { Problem } from "@prisma/client";
import { editProblem } from "./actions";

export default function EditableAnswer({
  problem,
  label,
}: {
  problem: Problem;
  label: React.ReactNode;
}) {
  const action = editProblem.bind(null, problem.id);

  const saveAnswer = async (text: string) => {
    await action({ answer: text });
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
