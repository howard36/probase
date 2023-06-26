import { useState, useRef, useEffect, KeyboardEvent } from 'react';

export default function ClickToEditTextarea({
  savedText,
  onSave,
  onReset,
}: {
  savedText: string;
  onSave: (text: string) => void;
  onReset: () => void;
}) {
  const [text, setText] = useState(savedText);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const updateHeight = (textArea: HTMLTextAreaElement) => {
    textArea.style.height = "0px";
    const scrollHeight = textArea.scrollHeight;
    textArea.style.height = scrollHeight + "px";
  }

  // only runs on component init (i.e. when editing starts)
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea !== null) {
      const len = text.length;
      textArea.setSelectionRange(len, len);
      textArea.focus();
      updateHeight(textArea);
    }
  }, []);

  // on each text update
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea !== null) {
      updateHeight(textArea);
    }
  }, [text]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      onReset();
    }
  };

  return (
    <>
      <textarea
        value={text}
        ref={textAreaRef}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{resize: "none"}}
        className="bg-slate-50 w-full"
      />
      <div className="mt-4">
        <button
          onClick={() => onSave(text)}
          className="px-4 py-2 rounded-full bg-green-200 text-green-800 font-semibold text-sm"
        >
          Save Changes
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 text-slate-600 font-semibold text-sm"
        >
          Discard
        </button>
      </div>
    </>
  );
}
