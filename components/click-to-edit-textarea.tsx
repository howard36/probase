import { useState, useRef, useEffect } from 'react';
import ClickToEdit from '@/components/click-to-edit';

interface Props {
  label?: string;
  savedText: string;
  onSave: (text: string) => void;
  className?: string;
}

export default function ClickToEditTextarea({ label, savedText, onSave, className }: Props) {
  const [text, setText] = useState(savedText);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const updateHeight = (textArea: HTMLTextAreaElement) => {
    textArea.style.height = "0px";
    const scrollHeight = textArea.scrollHeight;
    textArea.style.height = scrollHeight + "px";
  }

  // on each text update
  useEffect(() => {
    if (textAreaRef.current !== null) {
      updateHeight(textAreaRef.current);
    }
  }, [text, textAreaRef]);

  const handleSave = () => {
    onSave(text);
  }

  const handleReset = () => {
    setText(savedText);
  }

  const handleEditStart = () => {
    const textArea = textAreaRef.current;
    if (textArea !== null) {
      const len = text.length;
      textArea.setSelectionRange(len, len);
      textArea.focus();
      updateHeight(textArea);
    }
  }

  return (
    <div className={className}>
      <ClickToEdit label={label} text={text} childRef={textAreaRef} onSave={handleSave} onReset={handleReset} onEditStart={handleEditStart}>
        <textarea value={text} ref={textAreaRef} onChange={e => setText(e.target.value)} style={{resize: "none"}} className="text-xl bg-slate-50 w-full"/>
      </ClickToEdit>
    </div>
  );
}
