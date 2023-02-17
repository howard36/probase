import { useRouter } from "next/router";
import {useState} from 'react';

const subjects = [
  "Algebra",
  "Combinatorics",
  "Geometry",
  "Number Theory",
];

export default function ProblemForm({ collection, problem }) {
  const router = useRouter();
  const [title, setTitle] = useState(problem?.title ?? "");
  const [subject, setSubject] = useState(problem?.subject ?? "");
  const [statement, setStatement] = useState(problem?.statement ?? "");
  const [answer, setAnswer] = useState(problem?.answer ?? "");
  const [solution, setSolution] = useState(problem?.solutions[0] ?? "");
  console.log({problem, title, subject, statement, answer, solution})

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (problem === undefined) {
      // add new problem
      const url = `/api/collections/${collection._id}/problems/add`;
      const pid = 'N4';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pid,
          title,
          subject,
          statement,
          answer,
          solution,
        })
      });
      if (response.status === 201) {
        router.push(`/c/${collection.cid}/p/${pid}`)
      } else {
        // TODO: retry with different PID
        console.error("inserting failed!");
      }
    } else {
      // edit existing problem
      const url = `/api/problems/${problem._id}/edit`;
      // TODO: change pid if subject changes
      const pid = problem.pid;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          subject,
          statement,
          answer,
          solution,
        })
      });
      if (response.status === 200) {
        router.push(`/c/${collection.cid}/p/${pid}`)
      } else {
        console.error("updating failed!");
      }
    }
  };
  
  return (
    <div className="container px-6 py-12 mx-auto flex">
      <div className="bg-white rounded-lg p-8 flex flex-col w-full relative z-10 shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <label className="leading-7 text-md text-gray-600">Title</label>
            <input value={title} onChange={(e)=>{setTitle(e.target.value)}} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></input>
          </div>
          <div className="relative mb-4">
            <label className="leading-7 text-md text-gray-600">Subject</label>
            <select value={subject} onChange={(e)=>{setSubject(e.target.value)}} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
              {subjects.map(s => <option value={s} key={s}>{s}</option>)}
            </select>
          </div>
          <div className="relative mb-4">
            <label className="leading-7 text-md text-gray-600">Problem Statement</label>
            <textarea value={statement} onChange={(e)=>{setStatement(e.target.value)}} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
          </div>
          <div className="relative mb-4">
            <label className="leading-7 text-md text-gray-600">Answer</label>
            <input value={answer} onChange={(e)=>{setAnswer(e.target.value)}} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></input>
          </div>
          <div className="relative mb-4">
            <label className="leading-7 text-md text-gray-600">Solution</label>
            <textarea value={solution} onChange={(e)=>{setSolution(e.target.value)}} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
          </div>
          <button className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Submit</button>
        </form>
      </div>
    </div>
  );
}
