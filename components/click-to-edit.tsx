import Latex from 'react-latex-next';
import { useState, useRef, useEffect } from 'react';

interface Props {
  label: string;
  savedText: string;
  saveCallback: CallableFunction;
}

// TODO: textarea height should always be large enough to fit the text without a scrollbar
export default function ClickToEdit({ label, savedText, saveCallback }: Props) {
  const [isEditing, setEditing] = useState(false);
  const [text, setText] = useState(savedText);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current !== null && isEditing) {
      const len = text.length;
      textAreaRef.current.setSelectionRange(len, len);
      textAreaRef.current.focus();
    }
  }, [isEditing, textAreaRef]);

  if (isEditing) {
    return (
      <div className="mb-8">
        <p className="mb-2 text-sm text-slate-500 font-semibold">{label}</p>
        {/* React works differently with inputs and textareas because of user input. Read documentation online */}
        <textarea value={text} ref={textAreaRef} onChange={e => setText(e.target.value)} className="text-xl bg-slate-50 w-full"/>
        <div className="mt-4">
          <button onClick={() => {setEditing(false); saveCallback(text)}} className="px-4 py-2 rounded-full bg-green-200 text-green-800 font-semibold text-sm">Save Changes</button>
          <button onClick={() => {setEditing(false); setText(savedText)}} className="px-4 py-2 text-slate-600 font-semibold text-sm">Discard</button>
        </div>
      </div>
    );
  } else {
    return (
      <div onClick={() => setEditing(true)} className="mb-8">
        <p className="mb-2 text-sm text-slate-500 font-semibold">{label}</p>
        <p className="text-xl mb-4"><Latex>{`${text}`}</Latex></p>
      </div>
    );
  };
}
