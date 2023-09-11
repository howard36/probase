import EditableAnswer from './editable-answer'
import Latex from '@/components/latex'
import type { Props } from './types'
import { canEditProblem } from '@/utils/permissions';
import Label from '@/components/label'

export default function Answer(props: Props) {
  const { problem, collection, permission, authors } = props;
  const canEdit = collection.cid === "demo" || canEditProblem(problem, permission, authors);
  const label = <Label text="ANSWER" />

  if (canEdit) {
    return <EditableAnswer problem={problem} label={label} />;
  } else {
    return <>
      {label}
      <Latex>{`${problem.answer}`}</Latex>
    </>;
  }
}
