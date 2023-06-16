import Latex from 'react-latex-next';
import { useState } from 'react';

export default function ClickToEdit({ label, savedText, saveCallback }) {
  const [isEditing, setEditing] = useState(false);
  const [text, setText] = useState(savedText);

  if (isEditing) {
    return (
      <div className="mb-8">
        <p className="mb-2 text-sm text-slate-500 font-semibold">{label}</p>
        {/* React works differently with inputs and textareas because of user input. Read documentation online */}
        <input type="text" value={text} onChange={e => setText(e.target.value)} className="text-xl bg-slate-50"></input>
        <div className="mt-4">
          <button onClick={() => {setEditing(false); saveCallback(text)}} className="px-4 py-2 rounded-full bg-green-200 text-green-800 font-semibold text-sm">Save Changes</button>
          <button onClick={() => {setEditing(false); setText(savedText)}} className="px-4 py-2 text-slate-600 font-semibold text-sm">Cancel</button>
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
