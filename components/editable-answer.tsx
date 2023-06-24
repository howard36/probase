import ClickToEdit from './click-to-edit';
import { Problem } from '@prisma/client';

export default function EditableAnswer({
  problem
}: {
  problem: Problem
}) {
  const saveAnswer = async (text: string) => {
    alert(text);
    // React waits for async functions to finish before updating the page
    // const url = `/api/problems/${problem.id}/edit`;
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     answer: text
    //   })
    // });
    // if (response.status !== 200) {
    //   console.error(`updating failed! status = ${response.status}`);
    // }
  }

  const label = <p className="mb-2 text-sm text-slate-500 font-semibold">ANSWER</p>;

  return (
    <ClickToEdit
      type="input"
      label={label}
      initialText={problem.answer}
      onSave={saveAnswer}
    />
  );
}