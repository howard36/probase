"use client";

import { useState } from "react";
import Latex from "@/components/latex";
import ClickToEditTextarea from "./click-to-edit-textarea";
import ClickToEditInput from "./click-to-edit-input";

export default function ClickToEdit({
  type,
  name,
  label,
  initialText,
  placeholder,
  autosave,
  onSave,
  required,
}: {
  type: "input" | "textarea";
  name: string;
  label?: React.ReactNode;
  initialText: string;
  placeholder?: string;
  autosave: boolean;
  /**
   * Called with the new text when the user saves. A save that persists
   * somewhere should return whether it succeeded; on `false` the editor
   * reopens with the user's text so nothing is lost. Synchronous savers
   * (local state) can return nothing.
   */
  onSave: (text: string) => void | Promise<boolean>;
  required: boolean;
}) {
  const [isEditing, setEditing] = useState(initialText === "");
  const [savedText, setSavedText] = useState(initialText);
  // Text to put back into the editor after a failed save.
  const [draft, setDraft] = useState<string | null>(null);

  const handleSave = (text: string) => {
    const previous = savedText;
    setSavedText(text);
    setDraft(null);
    setEditing(false);
    const result = onSave(text);
    if (result instanceof Promise) {
      result
        .then((saved) => {
          if (!saved) {
            setSavedText(previous);
            setDraft(text);
            setEditing(true);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const handleReset = () => {
    setDraft(null);
    if (savedText !== "") {
      setEditing(false);
    }
  };

  if (isEditing) {
    const editorText = draft ?? savedText;
    return (
      <div>
        {label}
        {type === "input" ? (
          <ClickToEditInput
            name={name}
            savedText={editorText}
            placeholder={placeholder}
            onSave={handleSave}
            onReset={handleReset}
            required={required}
          />
        ) : (
          <ClickToEditTextarea
            name={name}
            savedText={editorText}
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
        <input type="hidden" name={name} value={savedText} />
      </div>
    );
  }
}
