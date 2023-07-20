'use client'

import EditableTitle from './editable-title'
import Latex from 'react-latex-next'
import type { ProblemProps } from './types'
import { useSession } from 'next-auth/react'
import { canEditProblem } from './permissions'

export default function Title({
  problem,
}: {
  problem: ProblemProps
}) {
  const { data: session, status } = useSession();
  const canEdit = (status === 'loading') ? false : canEditProblem(session, problem);

  if (canEdit) {
    return <EditableTitle problem={problem} />;
  } else {
    return <p><Latex>{`${problem.title}`}</Latex></p>;
  }
}