'use client'

import EditableStatement from './editable-statement'
import Latex from 'react-latex-next'
import type { ProblemProps } from './types'
import { useSession } from 'next-auth/react'
import { canEditProblem } from './permissions'

export default function Statement({
  problem,
}: {
  problem: ProblemProps
}) {
  const { data: session, status } = useSession();
  const canEdit = (status === 'loading') ? false : canEditProblem(session, problem);

  if (canEdit) {
    return <EditableStatement problem={problem} />;
  } else {
    return <p><Latex>{`${problem.statement}`}</Latex></p>;
  }
}