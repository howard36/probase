import Comment from './comment';
import type { Props } from './types'
import { canAddComment } from '@/utils/permissions';

export default function Comments(props: Props) {
  const { problem, collection, permission, authors } = props;
  const canComment = canAddComment(permission);
  const allComments = problem.comments;

  const comments = (
    <div>
      <ul>
        {allComments.map((comment) => (
          <li key={comment.id}>
            <Comment comment={comment} />
          </li>
        ))}
      </ul>
    </div>
  )

  if (canComment) {
    return comments;
  } else {
    return comments;
  }
}
