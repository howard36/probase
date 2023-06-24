import Latex from 'react-latex-next';
import { useState, useRef, useEffect, RefObject, ReactNode } from 'react';
import ClickToEditTextarea2 from './click-to-edit-textarea2';

interface Props {
  label?: ReactNode;
  initialText: string;
  onSave: (text: string) => void;
  className?: string;
}

export default function ClickToEdit2({ label, initialText, onSave, className }: Props) {
  const [isEditing, setEditing] = useState(false);
  const [savedText, setSavedText] = useState(initialText);

  const handleSave = (text: string) => {
    setSavedText(text);
    onSave(text);
    setEditing(false);
  }

  const handleReset = () => {
    setEditing(false);
  }

  if (isEditing) {
    return (
      <div className={className}>
        {label}
        <ClickToEditTextarea2 savedText={savedText} onSave={handleSave} onReset={handleReset}/>
      </div>
    );
  } else {
    return (
      <div onClick={() => setEditing(true)} className={className}>
        {label}
        <p className="text-xl mb-4" style={{whiteSpace: "pre-wrap"}}><Latex>{`${savedText}`}</Latex></p>
      </div>
    );
  };
}
