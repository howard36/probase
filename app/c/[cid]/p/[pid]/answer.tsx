import EditableAnswer from './editable-answer'
import Latex from '@/components/latex'
import type { CollectionProps, ProblemProps } from './types'
import { promiseCanEditProblem } from './promise-can-edit'

export default async function Answer({
  problem,
  collection,
}: {
  problem: ProblemProps
  collection: CollectionProps
}) {
  const canEdit = await promiseCanEditProblem(problem, collection);
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
