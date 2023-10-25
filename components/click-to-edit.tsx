import { useState } from 'react'
import Latex from '@/components/latex'
import ClickToEditTextarea from './click-to-edit-textarea'
import ClickToEditInput from './click-to-edit-input'

export default function ClickToEdit({
  type,
  label,
  initialText,
  placeholder,
  autosave,
  onSave,
  required,
}: {
  type: "input" | "textarea"
  label?: React.ReactNode
  initialText: string
  placeholder?: string
  autosave: boolean
  onSave: (text: string) => void
  required: boolean
}) {
  const [isEditing, setEditing] = useState(initialText === "");
  const [savedText, setSavedText] = useState(initialText);

  const handleSave = (text: string) => {
    setSavedText(text);
    onSave(text);
    setEditing(false);
  }

  const handleReset = () => {
    if (savedText !== "") {
      setEditing(false);
    }
  }

  if (isEditing) {
    return (
      <div>
        {label}
        { (type === "input") ? (
          <ClickToEditInput
            savedText={savedText}
            placeholder={placeholder}
            autosave={true}
            onSave={handleSave}
            onReset={handleReset}
            required={required}
          />
        ) : (
          <ClickToEditTextarea
            savedText={savedText}
            placeholder={placeholder}
            autosave={autosave}
            onSave={handleSave}
            onReset={handleReset}
            required={required}
          />
        )}
      </div>
    );
  } else {
    return (
      <div onClick={() => setEditing(true)}>
        {label}
        <Latex>{`${savedText}`}</Latex>
      </div>
    );
  };
}
