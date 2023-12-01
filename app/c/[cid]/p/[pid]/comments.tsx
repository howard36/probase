'use client'

import { useState } from 'react';
import Comment from './comment';
import type { Props } from './types'
import { canAddComment } from '@/utils/permissions';
import { useRouter } from 'next/navigation';
import SubmitButton from '@/components/submit-button';

export default function Comments(props: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { problem, collection, permission, authors } = props;
  const canComment = canAddComment(permission);
  const allComments = problem.comments;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await fetch(`/api/comments/add`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
        text,
      })
    });
    if (response.status === 201) {
      setText("");
      router.refresh();
    } else {
      console.error("Failed to add comment!");
    }
    setIsSubmitting(false);
  };


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
      <form className="mb-6" onSubmit={handleSubmit}>
        <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-slate-200">
          <label htmlFor="comment" className="sr-only">Your comment</label>
          <textarea id="comment" rows={6}
              className="px-0 w-full text-sm text-slate-900 border-0 focus:ring-0 focus:outline-none"
              placeholder="Write a comment..." required value={text} onChange={(e)=>{setText(e.target.value)}} ></textarea>
        </div>
        <SubmitButton isSubmitting={isSubmitting} size="sm">
          Post comment
        </SubmitButton>
      </form>
      {comments}
    </div>
  )
}
