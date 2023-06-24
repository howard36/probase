import { Solution, Author } from '@prisma/client';
import ClickToEdit2 from './click-to-edit2';

interface SolutionProps extends Solution {
  authors: Pick<Author, 'displayName'>[];
}

interface Props {
  solution: SolutionProps;
}

export default function EditableSolution({ solution }: Props) {
  // const authorName = solution.authors[0].displayName;
  const saveSolution = async (text: string) => {
    alert(text);
    // React waits for async functions to finish before updating the page
    // const url = `/api/solutions/${solution.id}/edit`;
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     text
    //   })
    // });
    // if (response.status !== 200) {
    //   console.error(`updating failed! status = ${response.status}`);
    // }
  }

  const label = <p className="mb-2 text-sm text-slate-500 font-semibold">SOLUTION</p>;

  return <ClickToEdit2 type="textarea" label={label} initialText={solution.text} onSave={saveSolution}/>;
}
