'use client'

import EditableTitle from './editable-title'
import Latex from 'react-latex-next'
import type { CollectionProps, ProblemProps } from './types'
import { useSession } from 'next-auth/react'
import { canEditProblem } from '@/utils/permissions'

export default function Title({
  problem,
  collection,
}: {
  problem: ProblemProps
  collection: CollectionProps
}) {
  const { data: session, status } = useSession();
  const canEdit = (status === 'loading') ? false : canEditProblem(session, problem, collection);
  console.log(session?.authors); // For logging on problem page after adding a new problem

  if (canEdit) {
    return <EditableTitle problem={problem} />;
  } else {
    return <p><Latex>{`${problem.title}`}</Latex></p>;
  }
}