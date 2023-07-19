'use client'

import { Problem } from '@prisma/client'
import EditableStatement from './editable-statement'
import Latex from 'react-latex-next'

export default function Statement({
  problem,
  canEdit,
}: {
  problem: Problem
  canEdit: boolean
}) {
  if (canEdit) {
    return <EditableStatement problem={problem} />;
  } else {
    return <p><Latex>{`${problem.statement}`}</Latex></p>;
  }
}