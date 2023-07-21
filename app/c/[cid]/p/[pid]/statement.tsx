'use client'

import EditableStatement from './editable-statement'
import Latex from 'react-latex-next'
import type { CollectionProps, ProblemProps } from './types'
import { useSession } from 'next-auth/react'
import { canEditProblem } from '@/utils/permissions'

export default function Statement({
  problem,
  collection,
}: {
  problem: ProblemProps
  collection: CollectionProps
}) {
  const { data: session, status } = useSession();
  const canEdit = (status === 'loading') ? false : canEditProblem(session, problem, collection);

  if (canEdit) {
    return <EditableStatement problem={problem} />;
  } else {
    return <p><Latex>{`${problem.statement}`}</Latex></p>;
  }
}