'use client'

import ClickToEdit from './click-to-edit'
import { Problem } from '@prisma/client'

export default function EditableTitle({
  problem
}: {
  problem: Problem
}) {
  const saveTitle = async (text: string) => {
    // alert(text);
    // React waits for async functions to finish before updating the page
    const url = `/api/problems/${problem.id}/edit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: text
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
      type="input"
      initialText={problem.title}
      onSave={saveTitle}
    />
  );
}