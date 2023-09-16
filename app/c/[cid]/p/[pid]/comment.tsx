import EditableStatement from './editable-statement'
import Latex from '@/components/latex'
import type { CommentProps } from './types'
// import { canEditComment } from '@/utils/permissions';

export default function Comment({
  comment
}: {
  comment: CommentProps
}) {
  // const canEdit = canEditComment(problem, permission, authors);
  const canEdit = false;

  if (canEdit) {
    return <Latex>{`${comment.text}`}</Latex>;
  } else {
    return <Latex>{`${comment.text}`}</Latex>;
  }
}
