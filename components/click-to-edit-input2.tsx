import { useState, useRef, useEffect, ReactNode } from 'react';

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

  return (
    <>
      <input value={text} ref={inputRef} onChange={e => setText(e.target.value)} style={{resize: "none"}} className="text-xl bg-slate-50 w-full"/>
      <div className="mt-4">
        <button onClick={() => onSave(text)} className="px-4 py-2 rounded-full bg-green-200 text-green-800 font-semibold text-sm">Save Changes</button>
        <button onClick={onReset} className="px-4 py-2 text-slate-600 font-semibold text-sm">Discard</button>
      </div>
    </>
  );
}
