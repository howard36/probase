"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const editorRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const displayRef = useRef<HTMLDivElement>(null);
  // Set when the editor closes while it has focus (Enter or Escape), so that
  // focus goes back to the field instead of being dropped on the page.
  const [returnFocus, setReturnFocus] = useState(false);

  useEffect(() => {
    if (returnFocus && !isEditing) {
      displayRef.current?.focus();
      setReturnFocus(false);
    }
  }, [returnFocus, isEditing]);

  const editorHasFocus = () =>
    editorRef.current?.contains(document.activeElement) ?? false;

  // Follow the server's text when it changes (someone else's edit, seen on
  // a refresh). While the editor is open, what the user is typing wins; the
  // newer text is kept for when they close the editor without a change.
  const [seenInitialText, setSeenInitialText] = useState(initialText);
  const [newerText, setNewerText] = useState<string | null>(null);
  if (initialText !== seenInitialText) {
    setSeenInitialText(initialText);
    if (isEditing) {
      setNewerText(initialText);
    } else {
      setSavedText(initialText);
    }
  }

  const handleSave = (text: string) => {
    setReturnFocus(editorHasFocus());
    if (text === savedText) {
      // Nothing changed: close without writing the old text back over
      // someone else's newer edit, and show theirs.
      if (newerText !== null) {
        setSavedText(newerText);
        setNewerText(null);
      }
      setDraft(null);
      setEditing(false);
      return;
    }
    setNewerText(null);
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
    setReturnFocus(editorHasFocus());
    setDraft(null);
    // Show the newest text, which may have changed while the editor was open.
    const shown = newerText ?? savedText;
    setSavedText(shown);
    setNewerText(null);
    if (shown !== "") {
      setEditing(false);
    }
  };

  if (isEditing) {
    const editorText = draft ?? savedText;
    return (
      <div ref={editorRef}>
        {label !== undefined && <div id={labelId}>{label}</div>}
        {type === "input" ? (
          <ClickToEditInput
            name={name}
            labelledBy={label !== undefined ? labelId : undefined}
            savedText={editorText}
            placeholder={placeholder}
            onSave={handleSave}
            onReset={handleReset}
            required={required}
          />
        ) : (
          <ClickToEditTextarea
            name={name}
            labelledBy={label !== undefined ? labelId : undefined}
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
      <div
        ref={displayRef}
        role="button"
        tabIndex={0}
        aria-label={`Edit ${name}`}
        onClick={() => setEditing(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setEditing(true);
          }
        }}
        className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
      >
        {label}
        <Latex>{`${savedText}`}</Latex>
        <input type="hidden" name={name} value={savedText} />
      </div>
    );
  }
}
