'use client'

import { Problem } from '@prisma/client'
import EditableTitle from './editable-title'
import Latex from 'react-latex-next'

export default function Title({
  problem,
  canEdit,
}: {
  problem: Problem
  canEdit: boolean
}) {
  if (canEdit) {
    return <EditableTitle problem={problem} />;
  } else {
    return <p><Latex>{`${problem.title}`}</Latex></p>;
  }
}