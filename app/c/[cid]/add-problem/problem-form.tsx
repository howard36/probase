"use client";

import { useState } from "react";
import type { Collection, Subject } from "@prisma/client";
import ClickToEdit from "@/components/click-to-edit";
import Label from "@/components/label";
import AimeInput from "@/components/aime-input";
import SubmitButton from "@/components/submit-button";
import { addProblem } from "./actions";
import BackButton from "@/components/back-button";
import { wrapAction } from "@/lib/server-actions";
import IntegerInput from "@/components/integer-input";

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

let difficultyTiers = ["Very easy", "Easy", "Medium", "Hard", "Very hard"];

// TODO: types?
export default function ProblemForm({
  collection,
  authorId,
}: {
  collection: Collection;
  authorId: number;
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [statement, setStatement] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [solution, setSolution] = useState("");

  const titleLabel = <Label text="TITLE" />;
  const statementLabel = <Label text="PROBLEM STATEMENT" />;
  const answerLabel = <Label text="ANSWER" />;
  const solutionLabel = <Label text="SOLUTION" />;

  let answerInput;
  if (collection.answerFormat === "ShortAnswer") {
    answerInput = (
      <div className="my-8">
        <ClickToEdit
          name="answer"
          type="input"
          label={answerLabel}
          initialText={answer}
          placeholder="$42$"
          autosave={true}
          onSave={(text: string) => setAnswer(text)}
          required={collection.requireAnswer}
        />
      </div>
    );
  } else if (collection.answerFormat === "Integer") {
    answerInput = (
      <div>
        {answerLabel}
        <IntegerInput
          value={answer}
          onValueChange={setAnswer}
          required={collection.requireAnswer}
        />
      </div>
    );
  } else if (collection.answerFormat === "AIME") {
    answerInput = (
      <div>
        {answerLabel}
        <AimeInput
          value={answer}
          onValueChange={setAnswer}
          required={collection.requireAnswer}
        />
      </div>
    );
  }

  if (collection.cid === "otis-mock-aime") {
    difficultyTiers = [
      "AIME 1-3",
      "AIME 4-6",
      "AIME 7-9",
      "AIME 10-12",
      "AIME 13-15",
    ];
  }

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mb-8 inline-block sm:mb-16">
        <BackButton
          href={`/c/${collection.cid}`}
          label={`Back to ${collection.name}`}
        />
      </div>
      <div className="mx-auto w-112 max-w-full text-base sm:w-128 sm:text-lg md:w-144 md:text-xl">
        <form
          action={(formData: FormData) =>
            wrapAction(addProblem)(collection.id, formData)
          }
        >
          <div className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
            <ClickToEdit
              name="title"
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
            <select
              name="subject"
              value={subject}
              required
              onChange={(e: React.ChangeEvent<SubjectSelectElement>) => {
                setSubject(e.target.value);
              }}
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-1 leading-8 text-slate-800 outline-none transition-colors duration-200 ease-in-out focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            >
              <option value="" key="Empty" disabled></option>
              {subjects.map((s) => (
                <option value={s.enum} key={s.enum}>
                  {s.display}
                </option>
              ))}
            </select>
          </div>
          <div className="my-8">
            <Label text="DIFFICULTY" />
            <select
              name="difficulty"
              value={difficulty}
              required={collection.requireDifficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
              }}
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-1 leading-8 text-slate-800 outline-none transition-colors duration-200 ease-in-out focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            >
              <option value="" disabled></option>
              {difficultyTiers.map((tier, idx) => (
                <option value={idx + 1} key={idx}>
                  {tier}
                </option>
              ))}
            </select>
          </div>
          <div className="my-8">
            <ClickToEdit
              name="statement"
              type="textarea"
              label={statementLabel}
              initialText={statement}
              placeholder="Given a triangle $ABC$ with circumcenter $O$ and circumcircle $\Gamma$ ..."
              autosave={true}
              onSave={(text: string) => setStatement(text)}
              required={true}
            />
          </div>
          <div className="my-8">{answerInput}</div>
          <div className="my-8">
            <ClickToEdit
              name="solution"
              type="textarea"
              label={solutionLabel}
              initialText={solution}
              placeholder="Since $O$ is the circumcenter, it lies on the perpendicular bisector of $BC$ ..."
              autosave={true}
              onSave={(text: string) => setSolution(text)}
              required={collection.requireSolution}
            />
          </div>
          <input name="authorId" value={authorId} type="hidden" />
          <SubmitButton>Submit</SubmitButton>
        </form>
      </div>
    </div>
  );
}
