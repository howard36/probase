import { useState } from 'react';
import ClickToEdit from '@/components/click-to-edit';

export default function Answer({ initialText }) {
  const [answerText, setAnswerText] = useState(initialText);
  const saveAnswer = async (text) => {
    setAnswerText(text);
    // React waits for async functions to finish before updating the page
    // await prisma.problem.update({
    //   where: { id: problem.id },
    //   data: {
    //     answer: text
    //   }
    // });
  }

  return <ClickToEdit label="ANSWER" savedText={answerText} saveCallback={saveAnswer}/>;
}
