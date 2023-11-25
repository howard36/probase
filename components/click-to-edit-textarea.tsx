'use client'

import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'

export default function ClickToEditTextarea({
  savedText,
  placeholder,
  autosave,
  onSave,
  onReset,
  required,
}: {
  savedText: string
  placeholder?: string
  autosave: boolean
  onSave: (text: string) => void
  onReset: () => void
  required: boolean
}) {
  const [text, setText] = useState(savedText);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const updateHeight = (textArea: HTMLTextAreaElement) => {
    textArea.style.height = "0px";
    const newHeight = Math.max(textArea.scrollHeight, 56);
    textArea.style.height = newHeight + "px";
  }

  // only runs on component init (i.e. when editing starts)
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea !== null) {
      const len = savedText.length;
      textArea.setSelectionRange(len, len);
      textArea.focus();
      updateHeight(textArea);
    }
  }, [savedText.length]);

  // on each text update
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea !== null) {
      updateHeight(textArea);
    }
  }, [text]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      onReset();
    } else if (event.key === 'Enter' && (event.shiftKey || event.ctrlKey || event.metaKey)) { 
      // Equivalent to clicking the "Save Changes" button
      if (text !== "") {
        onSave(text);
      }
    }
  };

  return (
    <>
      <textarea
        value={text}
        placeholder={placeholder}
        ref={textAreaRef}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => (autosave && text !== "") && onSave(text)}
        required={required}
        style={{resize: "none"}}
        className="bg-slate-50 w-full rounded-md"
      />
      { !autosave && <div className="mt-4">
        <button
          onClick={() => (text !== "") && onSave(text)}
          className="w-40 py-3 rounded-md bg-green-200 text-green-800 font-semibold text-base leading-none"
        >
          Save changes
        </button>
        <button
          onClick={onReset}
          className="ml-2 px-8 py-3 rounded-md text-slate-600 font-semibold text-base leading-none"
        >
          Discard
        </button>
      </div>}
    </>
  );
}
