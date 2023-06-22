import { useState } from 'react';
import ClickToEdit from '@/components/click-to-edit';
import { Solution, Author } from '@prisma/client';

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
    const url = `/api/solutions/${solution.id}/edit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text
      })
    });
    if (response.status !== 200) {
      console.error(`updating failed! status = ${response.status}`);
    }
  }

  return <ClickToEdit label={`SOLUTION (by ${authorName})`} savedText={solutionText} saveCallback={saveSolution}/>;
}
