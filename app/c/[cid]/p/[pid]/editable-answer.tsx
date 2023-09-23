'use client'

import ClickToEdit from '@/components/click-to-edit';
import type { Problem } from '@prisma/client';
import { useRouter } from 'next/navigation'

export default function EditableAnswer({
  problem,
  label,
}: {
  problem: Problem
  label: React.ReactNode
}) {
  const router = useRouter();

  const saveAnswer = async (text: string) => {
    // alert(text);
    // React waits for async functions to finish before updating the page
    const url = `/api/problems/${problem.id}/edit`;
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer: text
      }),
    });
    if (response.status === 200) {
      router.refresh();
    } else {
      console.error(`updating failed! status = ${response.status}`);
    }
  }

  if (problem.answer === null) {
    throw new Error("problem.answer is null, EditableAnswer shouldn't even render");
  }

  return (
    <ClickToEdit
      type="input"
      label={label}
      initialText={problem.answer}
      autosave={true}
      onSave={saveAnswer}
      required={false}
    />
  );
}