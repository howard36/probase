"use client";

import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";

export default function ClickToEditInput({
  name,
  savedText,
  placeholder,
  onSave,
  onReset,
  required,
}: {
  name: string;
  savedText: string;
  placeholder?: string;
  onSave: (text: string) => void;
  onReset: () => void;
  required: boolean;
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
      name={name}
      value={text}
      placeholder={placeholder}
      ref={inputRef}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => text !== "" && onSave(text)}
      className="w-full rounded-md bg-slate-50"
      required={required}
    />
  );
}
