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

  const label = <p className="mb-2 text-sm text-slate-500 font-semibold">ANSWER</p>;

  if (canEdit) {
    return <EditableAnswer problem={problem} label={label} />;
  } else {
    return <>
      {label}
      <Latex>{`${problem.answer}`}</Latex>
    </>;
  }
}
