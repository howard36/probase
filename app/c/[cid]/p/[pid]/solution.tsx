'use client'

import EditableSolution from './editable-solution'
import Latex from 'react-latex-next'
import type { SolutionProps } from './types'
import { useSession } from 'next-auth/react'
import { canEditSolution } from '@/utils/permissions'

export default function Solution({
  solution,
  collectionId,
}: {
  solution: SolutionProps
  collectionId: number
}) {
  const { data: session, status } = useSession();
  const canEdit = (status === 'loading') ? false : canEditSolution(session, solution, collectionId);

  if (canEdit) {
    return <EditableSolution solution={solution} />;
  } else {
    return <p><Latex>{`${solution.text}`}</Latex></p>;
  }
}
