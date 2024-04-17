import { AccessLevel, Collection, Problem, SolveAttempt, TestProblem } from "@prisma/client";
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
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="mb-8 sm:mb-16 inline-block">
        <BackButton
          href={`/c/${collection.cid}`}
          label={`Back to ${collection.name}`}
        />
      </div>
      <div className="w-128 sm:w-144 md:w-160 max-w-full mx-auto text-base sm:text-lg md:text-xl">
        <div className="px-8 text-3xl sm:text-4xl text-slate-900 font-bold mb-12">
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
