import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Props {
  savedText: string;
  onSave: (text: string) => void;
  onReset: () => void;
}

export default function ClickToEditInput2({ savedText, onSave, onReset }: Props) {
  const [text, setText] = useState(savedText);
  const inputRef = useRef<HTMLInputElement>(null);

  // only runs on component init (i.e. when editing starts)
  useEffect(() => {
    const input = inputRef.current;
    if (input !== null) {
      const len = text.length;
      input.setSelectionRange(len, len);
      input.focus();
    }
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSave(text);
    } else if (event.key === "Escape") {
      onReset();
    }
  };

  return <input value={text} ref={inputRef} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} className="text-xl bg-slate-50 w-full"/>;
}
