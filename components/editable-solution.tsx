import { useState } from 'react';
import ClickToEdit from '@/components/click-to-edit';
import { Solution, Author } from '@prisma/client';
import prisma from '@/utils/prisma';

interface SolutionProps extends Solution {
  authors: Pick<Author, 'displayName'>[];
}

interface Props {
  solution: SolutionProps;
}

export default function EditableSolution({ solution }: Props) {
  const [solutionText, setSolutionText] = useState(solution.text);
  const authorName = solution.authors[0].displayName;
  const saveSolution = async (text: string) => {
    setSolutionText(text);
    // React waits for async functions to finish before updating the page
    // await prisma.solution.update({
    //   where: { id: solution.id },
    //   data: {
    //     text
    //   }
    // });
  }

  return <ClickToEdit label={`SOLUTION (by ${authorName})`} savedText={solutionText} saveCallback={saveSolution} type="textarea"/>;
}
