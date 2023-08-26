'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Collection, Subject } from '@prisma/client'

interface SubjectSelectElement extends HTMLSelectElement {
  value: Subject;
}

const subjects = [
  {
    enum: "Algebra",
    display: "Algebra",
    short: "Alg",
    letter: "A",
  },
  {
    enum: "Combinatorics",
    display: "Combinatorics",
    short: "Combo",
    letter: "C",
  },
  {
    enum: "Geometry",
    display: "Geometry",
    short: "Geo",
    letter: "G",
  },
  {
    enum: "NumberTheory",
    display: "Number Theory",
    short: "NT",
    letter: "N",
  },
];

// TODO: types?
export default function ProblemForm({
  collection,
  authorId,
}: {
  collection: Collection
  authorId: number
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [statement, setStatement] = useState("");
  const [answer, setAnswer] = useState("");
  const [solution, setSolution] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setSubmitting(true);
    e.preventDefault();

    // add new problem
    const url = `/api/problems/add`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionId: collection.id,
        title,
        subject,
        statement,
        answer,
        solutionText: solution,
        authorId,
        difficulty: 0,
        isAnonymous: false,
      })
    });
    if (response.status === 201) {
      const newProblem = await response.json();
      router.push(`/c/${collection.cid}/p/${newProblem.pid}`)
    } else {
      // TODO: retry with different PID
      console.error("inserting failed!");
    }
  };

  // TODO: add author picker to form
  return (
    <div className="container px-6 py-12 mx-auto flex">
      <div className="bg-white rounded-lg p-8 flex flex-col w-full relative z-10 shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <label className="leading-7 text-md text-gray-600">Title</label>
            <input value={title} required onChange={(e)=>{setTitle(e.target.value)}} className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></input>
          </div>
          <div className="relative mb-4">
            <label className="leading-7 text-md text-gray-600">Subject</label>
            <select value={subject} required onChange={(e: React.ChangeEvent<SubjectSelectElement>)=>{setSubject(e.target.value)}} className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
              <option value="" key="Empty" disabled></option>
              {subjects.map(s => <option value={s.enum} key={s.enum}>{s.display}</option>)}
            </select>
          </div>
          <div className="relative mb-4">
            <label className="leading-7 text-md text-gray-600">Problem Statement</label>
            <textarea value={statement} required onChange={(e)=>{setStatement(e.target.value)}} className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
          </div>
          <div className="relative mb-4">
            <label className="leading-7 text-md text-gray-600">Answer</label>
            <input value={answer} required onChange={(e)=>{setAnswer(e.target.value)}} className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></input>
          </div>
          <div className="relative mb-4">
            <label className="leading-7 text-md text-gray-600">Solution</label>
            <textarea value={solution} required onChange={(e)=>{setSolution(e.target.value)}} className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
          </div>
          <button disabled={isSubmitting} className="text-white text-lg font-bold rounded border-0 py-2 w-40 bg-blue-500 hover:bg-blue-600 focus:outline-none flex flex-auto items-center justify-center">
            { isSubmitting && <div className="animate-spin rounded-full border-solid border-blue-400 border-l-blue-50 border-4 h-6 w-6 mr-3 inline-block"></div> }
            { isSubmitting ? "Saving..." : "Submit" }
          </button>
        </form>
      </div>
    </div>
  );
}
