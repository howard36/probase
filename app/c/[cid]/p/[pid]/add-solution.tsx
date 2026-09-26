"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import type { KeyboardEvent } from "react";
import { addSolution } from "./actions";
import { runAction } from "@/lib/server-actions";

export default function AddSolution({ problemId }: { problemId: number }) {
  const [isEditing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, startSubmitting] = useTransition();
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

  // One submission at a time: a double click must not add two solutions.
  // On success the page shows the new solution in place of this box; on
  // failure the text stays for another try.
  const handleSubmit = () => {
    if (text === "" || isSubmitting) {
      return;
    }
    startSubmitting(async () => {
      await runAction(addSolution)(problemId, text);
    });
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
      handleSubmit();
    }
  };

  if (isEditing) {
    return (
      <div className="mb-24 mt-16">
        <textarea
          value={text}
          placeholder="Write your solution here!"
          aria-label="Your solution"
          ref={textAreaRef}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          required
          style={{ resize: "none" }}
          className="w-full rounded-md bg-slate-50"
        />
        <div className="mt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-40 rounded-md bg-green-200 py-3 text-base font-semibold leading-none text-green-800 disabled:cursor-wait disabled:opacity-60"
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
