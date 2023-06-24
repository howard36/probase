import Latex from 'react-latex-next';
import { useState, ReactNode } from 'react';
import ClickToEditTextarea from './click-to-edit-textarea';
import ClickToEditInput from './click-to-edit-input';

interface Props {
  type: "input" | "textarea";
  label?: ReactNode;
  initialText: string;
  onSave: (text: string) => void;
}

export default function ClickToEdit({ type, label, initialText, onSave }: Props) {
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
      <>
        {label}
        { type === "input" ? 
          <ClickToEditInput savedText={savedText} onSave={handleSave} onReset={handleReset}/>
        : <ClickToEditTextarea savedText={savedText} onSave={handleSave} onReset={handleReset}/>
        }
      </>
    );
  } else {
    return (
      <div onClick={() => setEditing(true)}>
        {label}
        <p className="text-xl mb-4" style={{whiteSpace: "pre-wrap"}}><Latex>{`${savedText}`}</Latex></p>
      </div>
    );
  };
}
