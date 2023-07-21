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

  if (canEdit) {
    return <EditableSolution solution={solution} />;
  } else {
    return <p><Latex>{`${solution.text}`}</Latex></p>;
  }
}
