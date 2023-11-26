'use client'

import { useState } from 'react';
import Comment from './comment';
import type { Props } from './types'
import { canAddComment } from '@/utils/permissions';
import { useRouter } from 'next/navigation';

export default function Comments(props: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  
  const { problem, collection, permission, authors } = props;
  const canComment = canAddComment(permission);
  const allComments = problem.comments;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setSubmitting(true);

    // add new problem
    const url = `/api/comments/add`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId: problem.id,
        text,
      })
    });
    if (response.status === 201) {
      router.refresh();
      setText("");
    } else {
      console.error("add comment failed!");
    }
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
        <button type="submit"
          className="inline-flex items-center py-3 px-6 text-sm font-semibold text-center text-slate-50 bg-blue-500 rounded-md focus:ring-4 focus:ring-primary-200 hover:bg-blue-600">
          Post comment
        </button>
      </form>
      {comments}
    </div>
  )
}
