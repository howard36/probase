import Latex from 'react-latex-next';
import { useState, useRef, useEffect, RefObject, ReactNode } from 'react';

interface Props {
  label?: ReactNode;
  text: string;
  childRef: RefObject<HTMLTextAreaElement>;
  onSave: () => void;
  onReset: () => void;
  onEditStart?: () => void;
  children: ReactNode;
}

export default function ClickToEdit({ label, text, onSave, onReset, onEditStart, children }: Props) {
  const [isEditing, setEditing] = useState(false);

  useEffect(() => {
    if (isEditing && onEditStart !== undefined) {
      onEditStart();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div>
        {/* React works differently with inputs and textareas because of user input. Read documentation online */}
        {label}
        {children}
        <div className="mt-4">
          <button onClick={() => {setEditing(false); onSave()}} className="px-4 py-2 rounded-full bg-green-200 text-green-800 font-semibold text-sm">Save Changes</button>
          <button onClick={() => {setEditing(false); onReset()}} className="px-4 py-2 text-slate-600 font-semibold text-sm">Discard</button>
        </div>
      </div>
    );
  } else {
    return (
      <div onClick={() => setEditing(true)}>
        {label}
        <p className="text-xl mb-4" style={{whiteSpace: "pre-wrap"}}><Latex>{`${text}`}</Latex></p>
      </div>
    );
  };
}