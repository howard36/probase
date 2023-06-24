import ClickToEdit from './click-to-edit';

interface Props {
  initialText: string;
  problemId: number;
};

export default function EditableAnswer({ initialText, problemId }: Props) {
  const saveAnswer = async (text: string) => {
    alert(text);
    // React waits for async functions to finish before updating the page
    // const url = `/api/problems/${problemId}/edit`;
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     answer: text
    //   })
    // });
    // if (response.status !== 200) {
    //   console.error(`updating failed! status = ${response.status}`);
    // }
  }

  const label = <p className="mb-2 text-sm text-slate-500 font-semibold">ANSWER</p>;

  return <ClickToEdit type="input" label={label} initialText={initialText} onSave={saveAnswer}/>;
}
