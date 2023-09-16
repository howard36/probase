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

  return (
    <div>
      <h2 className="mb-6 text-lg lg:text-2xl font-bold text-slate-900">Discussion</h2>
      <form className="mb-6">
        <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200">
          <label htmlFor="comment" className="sr-only">Your comment</label>
          <textarea id="comment" rows={6}
              className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none"
              placeholder="Write a comment..." required></textarea>
        </div>
        <button type="submit"
          className="inline-flex items-center py-3 px-6 text-sm font-semibold text-center text-slate-50 bg-blue-500 rounded-lg focus:ring-4 focus:ring-primary-200 hover:bg-blue-600">
          Post comment
        </button>
      </form>
      {comments}
    </div>
  )
}
