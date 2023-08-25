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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer: text
      })
    });
    if (response.status === 200) {
      // await fetch('/api/revalidate?path=/c/[cid]');
      // await fetch('/api/revalidate?path=/c/[cid]/p/[pid]');
      router.refresh();
    } else {
      console.error(`updating failed! status = ${response.status}`);
    }
  }

  return (
    <ClickToEdit
      type="input"
      label={label}
      initialText={problem.answer}
      onSave={saveAnswer}
    />
  );
}