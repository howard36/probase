'use client'

import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'

export default function ClickToEditInput({
  savedText,
  placeholder,
  autosave,
  onSave,
  onReset,
}: {
  savedText: string
  placeholder?: string
  autosave: boolean
  onSave: (text: string) => void
  onReset: () => void
}) {
  const [text, setText] = useState(savedText);
  const inputRef = useRef<HTMLInputElement>(null);

  // only runs on component init (i.e. when editing starts)
  useEffect(() => {
    const input = inputRef.current;
    if (input !== null) {
      const len = savedText.length;
      input.setSelectionRange(len, len);
      input.focus();
    }
  }, [savedText.length]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (text !== "") {
        onSave(text);
      }
    } else if (event.key === "Escape") {
      onReset();
    }
  };

  return (
    <input
      value={text}
      placeholder={placeholder}
      ref={inputRef}
      onChange={e => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => (text !== "") && onSave(text)}
      className="bg-slate-50 w-full rounded-md"
    />
  );
}
