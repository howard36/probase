import EditableSolution from './editable-solution'
import Latex from '@/components/latex'
import type { AuthorProps, PermissionProps, SolutionProps } from './types'
import { canEditSolution2 } from '@/utils/permissions'

export default function Solution({
  solution,
  permission,
  authors,
}: {
  solution: SolutionProps
  permission: PermissionProps
  authors: AuthorProps[]
}) {
  const canEdit = canEditSolution2(solution, permission, authors);
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
