import { useState } from 'react';
import ClickToEdit from '@/components/click-to-edit';
import prisma from '@/utils/prisma';

export default function EditableAnswer({ initialText }) {
  const [answerText, setAnswerText] = useState(initialText);
  const saveAnswer = async (text: string) => {
    setAnswerText(text);
    // React waits for async functions to finish before updating the page
    // await prisma.problem.update({
    //   where: { id: problem.id },
    //   data: {
    //     answer: text
    //   }
    // });
  }

  return <ClickToEdit label="ANSWER" savedText={answerText} saveCallback={saveAnswer} type="input"/>;
}
