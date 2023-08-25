import EditableStatement from './editable-statement'
import Latex from '@/components/latex'
import type { CollectionProps, ProblemProps } from './types'
import { promiseCanEditProblem } from './promise-can-edit'

export default async function Statement({
  problem,
  collection,
}: {
  problem: ProblemProps
  collection: CollectionProps
}) {
  const canEdit = await promiseCanEditProblem(problem, collection);

  if (canEdit) {
    return <EditableStatement problem={problem} />;
  } else {
    return <Latex>{`${problem.statement}`}</Latex>;
  }
}