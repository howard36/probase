'use client'

import ClickToEdit from '@/components/click-to-edit';
import { Problem } from '@prisma/client';

export default function EditableStatement({
  problem
}: {
  problem: Problem
}) {
  const saveStatement = async (text: string) => {
    // alert(text);
    // React waits for async functions to finish before updating the page
    const url = `/api/problems/${problem.id}/edit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        statement: text
      })
    });
    if (response.status === 200) {
      await fetch('/api/revalidate?path=/c/[cid]');
      await fetch('/api/revalidate?path=/c/[cid]/p/[pid]');
    } else {
      console.error(`updating failed! status = ${response.status}`);
    }
  }

  return (
    <ClickToEdit
      type="textarea"
      initialText={problem.statement}
      onSave={saveStatement}
    />
  );
}
