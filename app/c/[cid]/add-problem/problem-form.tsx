'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Collection, Subject } from '@prisma/client'
import Link from 'next/link'
import ClickToEdit from '@/components/click-to-edit'
import Label from '@/components/label'
import AimeInput from './aime-input'

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

let difficultyTiers = [
  "Very easy",
  "Easy",
  "Medium",
  "Hard",
  "Very hard",
]

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
  const [difficulty, setDifficulty] = useState("");
  const [solution, setSolution] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // submit new problem
    const url = `/api/problems/add`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionId: collection.id,
        title,
        subject,
        statement,
        answer: (answer === "") ? null : answer,
        solutionText: (solution === "") ? undefined : solution,
        authorId,
        difficulty: parseInt(difficulty),
        isAnonymous: false,
      })
    });
    if (response.status === 201) {
      const newProblem = await response.json();
      router.push(`/c/${collection.cid}/p/${newProblem.pid}`);
      router.refresh();
    } else {
      // TODO: retry with different PID (or use atomic increment)
      console.error("inserting failed!");
    }
  };

  const titleLabel = <Label text="TITLE" />;
  const statementLabel = <Label text="PROBLEM STATEMENT" />;
  const answerLabel = <Label text="ANSWER" />;
  const solutionLabel = <Label text="SOLUTION" />;

  let answerInput;
  if (collection.answerFormat === "ShortAnswer") {
    answerInput = <div className="my-8">
      <ClickToEdit
        type="input"
        label={answerLabel}
        initialText={answer}
        placeholder="$42$"
        autosave={true}
        onSave={(text: string) => setAnswer(text)}
        required={collection.requireAnswer}
      />
    </div>
  } else if (collection.answerFormat === "Integer") {
    // TODO
  } else if (collection.answerFormat === "AIME") {
    answerInput = <div>
      {answerLabel}
      <AimeInput
        value={answer}
        onValueChange={setAnswer}
        required={collection.requireAnswer}
      />
    </div>
  }

  if (collection.cid === "otis-mock-aime") {
    difficultyTiers = [
      "AIME 1-3",
      "AIME 4-6",
      "AIME 7-9",
      "AIME 10-12",
      "AIME 13-15",
    ]
  }

  return (
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="mb-8 sm:mb-16 inline-block">
        <Link href={`/c/${collection.cid}`} prefetch={true} className="text-slate-600 hover:text-slate-800 underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="ml-1">Back to {collection.name}</span>
        </Link>
      </div>
      <div className="mx-auto w-112 sm:w-128 md:w-144 max-w-full text-base sm:text-lg md:text-xl">
        <form onSubmit={handleSubmit}>
          <div className="text-2xl sm:text-3xl text-slate-900 font-bold mb-4">
            <ClickToEdit
              type="input"
              label={titleLabel}
              initialText={title}
              placeholder="Short and catchy title"
              autosave={true}
              onSave={(text: string) => setTitle(text)}
              required={true}
            />
          </div>
          <div className="my-8">
            <Label text="SUBJECT" />
            <select value={subject} required onChange={(e: React.ChangeEvent<SubjectSelectElement>)=>{setSubject(e.target.value)}} className="w-full bg-slate-50 rounded-md border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-slate-800 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
              <option value="" key="Empty" disabled></option>
              {subjects.map(s => <option value={s.enum} key={s.enum}>{s.display}</option>)}
            </select>
          </div>
          {/* 
          <div className={`py-2 px-6 inline-block mb-4 text-slate-50 font-semibold text-sm text-center leading-none rounded-full bg-gradient-to-r ${gradient}`}>
            {subject}
          </div>
          */}
          <div className="my-8">
            <Label text="DIFFICULTY" />
            <select value={difficulty} required={collection.requireDifficulty} onChange={(e) => {setDifficulty(e.target.value)}} className="w-full bg-slate-50 rounded-md border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-slate-800 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
              <option value="" disabled></option>
              {difficultyTiers.map((tier, idx) =>
                <option value={idx + 1} key={idx}>{tier}</option>
              )}
            </select>
          </div>
          <div className="my-8">
            <ClickToEdit
              type="textarea"
              label={statementLabel}
              initialText={statement}
              placeholder="Given a triangle $ABC$ with circumcenter $O$ and circumcircle $\Gamma$ ..."
              autosave={true}
              onSave={(text: string) => setStatement(text)}
              required={true}
            />
          </div>
          <div className="my-8">
            {answerInput}
          </div>
          <div className="my-8">
            <ClickToEdit
              type="textarea"
              label={solutionLabel}
              initialText={solution}
              placeholder="Since $O$ is the circumcenter, it lies on the perpendicular bisector of $BC$ ..."
              autosave={true}
              onSave={(text: string) => setSolution(text)}
              required={collection.requireSolution}
            />
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
