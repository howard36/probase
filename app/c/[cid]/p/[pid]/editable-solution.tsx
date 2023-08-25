import ClickToEdit from '@/components/click-to-edit';
import type { SolutionProps } from './types'
import { useRouter } from 'next/navigation'

export default function EditableSolution({
  solution,
  label,
}: {
  solution: SolutionProps
  label: React.ReactNode
}) {
  const router = useRouter();

  // const authorName = solution.authors[0].displayName;
  const saveSolution = async (text: string) => {
    // alert(text);
    // React waits for async functions to finish before updating the page
    const url = `/api/solutions/${solution.id}/edit`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text
      })
    });
    if (response.status === 200) {
      // await fetch('/api/revalidate?path=/c/[cid]');
      // await fetch('/api/revalidate?path=/c/[cid]/p/[pid]');
      router.refresh();
    } else {
      console.error(`updating failed! status = ${response.status}`);
    }
  }

  return (
    <ClickToEdit
      type="textarea"
      label={label}
      initialText={solution.text}
      onSave={saveSolution}
    />
  );
}
