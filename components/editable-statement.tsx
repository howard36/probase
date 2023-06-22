import { useState } from 'react';
import ClickToEdit from '@/components/click-to-edit';

interface Props {
  initialText: string;
  problemId: number;
};

export default function EditableStatement({ initialText, problemId }: Props) {
  const [text, setText] = useState(initialText);
  const save = async (text: string) => {
    setText(text);
    // React waits for async functions to finish before updating the page
    const url = `/api/problems/${problemId}/edit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        statement: text
      })
    });
    if (response.status !== 200) {
      console.error(`updating failed! status = ${response.status}`);
    }
  }

  return <ClickToEdit savedText={text} saveCallback={save} className="mb-4"/>;
}
