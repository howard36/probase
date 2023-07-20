'use client'

import EditableAnswer from '@/components/editable-answer'
import Latex from 'react-latex-next'
import type { ProblemProps } from './types'
import { useSession } from 'next-auth/react'
import { canEditProblem } from './permissions'

export default function Answer({
  problem,
}: {
  problem: ProblemProps
}) {
  const { data: session, status } = useSession();
  const canEdit = (status === 'loading') ? false : canEditProblem(session, problem);

  if (canEdit) {
    return <EditableAnswer problem={problem} />;
  } else {
    return <p><Latex>{`${problem.answer}`}</Latex></p>;
  }
}
