import { useState } from 'react';
import ClickToEdit from '@/components/click-to-edit';
import ClickToEditTextarea from './click-to-edit-textarea';

interface Props {
  initialText: string;
  problemId: number;
};

export default function EditableAnswer({ initialText, problemId }: Props) {
  const [answerText, setAnswerText] = useState(initialText);
  const saveAnswer = async (text: string) => {
    setAnswerText(text);
    // React waits for async functions to finish before updating the page
    const url = `/api/problems/${problemId}/edit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer: text
      })
    });
    if (response.status !== 200) {
      console.error(`updating failed! status = ${response.status}`);
    }
  }

  return <ClickToEditTextarea label="ANSWER" savedText={answerText} saveCallback={saveAnswer} className="mb-8"/>;
}
