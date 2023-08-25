'use client'

import EditableSolution from './editable-solution'
import Latex from 'react-latex-next'
import type { CollectionProps, SolutionProps } from './types'
import { useSession } from 'next-auth/react'
import { canEditSolution } from '@/utils/permissions'

export default function Solution({
  solution,
  collection,
}: {
  solution: SolutionProps
  collection: CollectionProps
}) {
  const { data: session, status } = useSession();
  const canEdit = (status === 'loading') ? false : canEditSolution(session, solution, collection);

  const label = <p className="mb-2 text-sm text-slate-500 font-semibold">SOLUTION</p>;

  if (canEdit) {
    return <EditableSolution solution={solution} label={label} />;
  } else {
    return <>
      {label}
      <Latex>{`${solution.text}`}</Latex>
    </>;
  }
}
