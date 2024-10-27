"use client";

import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { ProblemProps } from "./types";
import { addSolution } from "./actions";
import { wrapAction } from "@/lib/server-actions";

export default function AddSolution({
  problem,
  authorId,
}: {
  problem: ProblemProps;
  authorId: number;
}) {
  const [isEditing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const updateHeight = (textArea: HTMLTextAreaElement) => {
    textArea.style.height = "0px";
    const scrollHeight = Math.max(textArea.scrollHeight, 150);
    textArea.style.height = scrollHeight + "px";
  };

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea !== null) {
      const len = textArea.value.length;
      textArea.setSelectionRange(len, len);
      textArea.focus();
      updateHeight(textArea);
    }
  }, [isEditing]);

  // on each text update
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea !== null) {
      updateHeight(textArea);
    }
  }, [text]);

  const handleSubmit = () => {
    wrapAction(addSolution)(problem.id, text, authorId);
  };

  const handleDiscard = () => {
    setText("");
    setEditing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      handleDiscard();
    } else if (
      event.key === "Enter" &&
      (event.shiftKey || event.ctrlKey || event.metaKey)
    ) {
      // Equivalent to clicking the "Submit" button
      if (text !== "") {
        handleSubmit();
      }
    }
  };

  if (isEditing) {
    return (
      <div className="mb-24 mt-16">
        <textarea
          value={text}
          placeholder="Write your solution here!"
          ref={textAreaRef}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          required
          style={{ resize: "none" }}
          className="w-full rounded-md bg-slate-50"
        />
        <div className="mt-4">
          <button
            onClick={() => text !== "" && handleSubmit()}
            className="w-40 rounded-md bg-green-200 py-3 text-base font-semibold leading-none text-green-800"
          >
            Submit
          </button>
          <button
            onClick={handleDiscard}
            className="ml-2 rounded-md px-8 py-3 text-base font-semibold leading-none text-slate-600"
          >
            Discard
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="mb-24 mt-16 text-center">
        <div className="mb-5 text-lg font-semibold text-slate-500">
          No solutions yet. You could be the first!
        </div>
        <button
          className="w-44 rounded-md bg-violet-500 py-4 text-lg font-semibold leading-none text-slate-50 hover:bg-violet-600"
          onClick={() => setEditing(true)}
        >
          Add Solution
        </button>
      </div>
    );
  }
}
