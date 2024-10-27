import {
  AccessLevel,
  Collection,
  Problem,
  SolveAttempt,
  TestProblem,
} from "@prisma/client";
import TestCard from "./test-card";
import BackButton from "@/components/back-button";

interface ProblemWithAuthors extends Problem {
  authors: { id: number }[];
}

interface TestProblemWithProblem extends TestProblem {
  problem: ProblemWithAuthors;
}

interface Props {
  name: string;
  testProblems: TestProblemWithProblem[];
  collection: Collection;
  solveAttempts: SolveAttempt[];
  permission: { accessLevel: AccessLevel } | null;
  authors: { id: number }[];
}

export default function TestPage(props: Props) {
  const { name, testProblems, collection, solveAttempts, permission, authors } =
    props;

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mb-8 inline-block sm:mb-16">
        <BackButton
          href={`/c/${collection.cid}`}
          label={`Back to ${collection.name}`}
        />
      </div>
      <div className="mx-auto w-128 max-w-full text-base sm:w-144 sm:text-lg md:w-160 md:text-xl">
        <div className="mb-12 px-8 text-3xl font-bold text-slate-900 sm:text-4xl">
          {name}
        </div>
        <ol>
          {testProblems.map((testProblem: TestProblemWithProblem) => (
            <li key={testProblem.position}>
              <div className="my-8">
                <TestCard
                  position={testProblem.position}
                  problem={testProblem.problem}
                  collection={collection}
                  solveAttempts={solveAttempts}
                  permission={permission}
                  authors={authors}
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
