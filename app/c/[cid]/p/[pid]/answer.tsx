import EditableAnswer from './editable-answer'
import Latex from '@/components/latex'
import type { Props } from './types'
import { canEditProblem } from '@/utils/permissions';

export default function Answer(props: Props) {
  const { problem, permission, authors } = props;
  const canEdit = canEditProblem(problem, permission, authors);
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
