"use client";

import { useState } from "react";
import Comment from "./comment";
import type { Props } from "./types";
import SubmitButton from "@/components/submit-button";
import { addComment } from "./actions";

export default function Comments(props: Props) {
  const [text, setText] = useState("");

  const { problem } = props;
  const allComments = problem.comments;

  const action = async (formData: FormData) => {
    const resp = await addComment(problem.id, formData);
    if (resp.ok) {
      setText("");
    } else {
      console.error(resp.error.message);
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
  );

  return (
    <div>
      <h2 className="mb-4 text-lg lg:text-2xl font-bold text-slate-900">
        Discussion
      </h2>
      <form className="mb-6" action={action}>
        <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-slate-200">
          <label htmlFor="comment" className="sr-only">
            Your comment
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={6}
            className="px-0 w-full text-sm text-slate-900 border-0 focus:ring-0 focus:outline-none"
            placeholder="Write a comment..."
            required
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
          ></textarea>
        </div>
        <SubmitButton size="sm">
          Post comment
        </SubmitButton>
      </form>
      {comments}
    </div>
  );
}
