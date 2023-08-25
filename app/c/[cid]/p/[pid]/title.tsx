import EditableTitle from './editable-title'
import Latex from '@/components/latex'
import type { CollectionProps, ProblemProps } from './types'
import { promiseCanEditProblem } from './promise-can-edit'

export default async function Title({
  problem,
  collection,
}: {
  problem: ProblemProps
  collection: CollectionProps
}) {
  const canEdit = await promiseCanEditProblem(problem, collection);

  if (canEdit) {
    return <EditableTitle problem={problem} />;
  } else {
    return <Latex>{`${problem.title}`}</Latex>;
  }
}