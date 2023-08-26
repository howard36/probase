import EditableStatement from './editable-statement'
import Latex from '@/components/latex'
import type { Props } from './types'
import { canEditProblem2 } from '@/utils/permissions';

export default function Statement(props: Props) {
  const { problem, permission, authors } = props;
  const canEdit = canEditProblem2(problem, permission, authors);

  if (canEdit) {
    return <EditableStatement problem={problem} />;
  } else {
    return <Latex>{`${problem.statement}`}</Latex>;
  }
}