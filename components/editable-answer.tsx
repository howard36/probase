import { useState } from 'react';
import ClickToEdit from '@/components/click-to-edit';

export default function EditableAnswer({ initialText, problemId }) {
  const [answerText, setAnswerText] = useState(initialText);
  const saveAnswer = async (text: string) => {
    setAnswerText(text);
    // React waits for async functions to finish before updating the page
    // TODO: cannot use prisma on the frontend, so replace with API call
    // await prisma.problem.update({
    //   where: { id: problemId },
    //   data: {
    //     answer: text
    //   }
    // });
  }

  return <ClickToEdit label="ANSWER" savedText={answerText} saveCallback={saveAnswer}/>;
}
