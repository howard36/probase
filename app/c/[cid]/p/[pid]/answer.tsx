'use client'

import EditableAnswer from './editable-answer'
import Latex from 'react-latex-next'
import type { CollectionProps, ProblemProps } from './types'
import { useSession } from 'next-auth/react'
import { canEditProblem } from '@/utils/permissions'

export default function Answer({
  problem,
  collection,
}: {
  problem: ProblemProps
  collection: CollectionProps
}) {
  const { data: session, status } = useSession();
  const canEdit = (status === 'loading') ? false : canEditProblem(session, problem, collection);

  if (canEdit) {
    return <EditableAnswer problem={problem} />;
  } else {
    return <p><Latex>{`${problem.answer}`}</Latex></p>;
  }
}
