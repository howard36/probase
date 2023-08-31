'use client'

import { useState } from 'react'
import Latex from 'react-latex-next'
import ClickToEditTextarea from './click-to-edit-textarea'
import ClickToEditInput from './click-to-edit-input'

export default function ClickToEdit({
  type,
  label,
  initialText,
  placeholder,
  onSave,
}: {
  type: "input" | "textarea"
  label?: React.ReactNode
  initialText: string
  placeholder?: string
  onSave: (text: string) => void
}) {
  const [isEditing, setEditing] = useState(initialText === "");
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
        { (type === "input") ? (
          <ClickToEditInput
            savedText={savedText}
            placeholder={placeholder}
            onSave={handleSave}
            onReset={handleReset}
          />
        ) : (
          <ClickToEditTextarea
            savedText={savedText}
            placeholder={placeholder}
            onSave={handleSave}
            onReset={handleReset}
          />
        )}
      </>
    );
  } else {
    return (
      <div onClick={() => setEditing(true)}>
        {label}
        <p><Latex>{`${savedText}`}</Latex></p>
      </div>
    );
  };
}
