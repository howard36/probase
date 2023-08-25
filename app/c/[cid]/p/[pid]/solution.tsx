import EditableSolution from './editable-solution'
import Latex from '@/components/latex'
import type { CollectionProps, SolutionProps } from './types'
import { promiseCanEditSolution } from './promise-can-edit'

export default async function Solution({
  solution,
  collection,
}: {
  solution: SolutionProps
  collection: CollectionProps
}) {
  const canEdit = await promiseCanEditSolution(solution, collection);
  const label = <p className="mb-2 text-sm text-slate-500 font-semibold">SOLUTION</p>;

  if (canEdit) {
    return <EditableSolution solution={solution} label={label} />;
  } else {
    return <>
      {label}
      <Latex>{`${solution.text}`}</Latex>
    </>;
  }
}
