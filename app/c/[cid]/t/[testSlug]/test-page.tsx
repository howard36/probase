import Link from "next/link";
import TestCard from "./test-card";

export default function TestPage(props: any) {
  const { name, testProblems, collection, solveAttempts, permission, authors } = props;

  return (
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="mb-8 sm:mb-16 inline-block">
        <Link
          href={`/c/${collection.cid}`}
          prefetch={true}
          className="text-slate-600 hover:text-slate-800 underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          <span className="ml-1">Back to {collection.name}</span>
        </Link>
      </div>
      <div className="mx-auto w-112 sm:w-128 md:w-144 max-w-full text-base sm:text-lg md:text-xl">
        <div className="text-3xl sm:text-4xl text-slate-900 font-bold mb-12">
          {name}
        </div>
        <ol>
          {testProblems.map((testProblem: any) => (
            <li key={testProblem.position}>
              <div className="mb-16">
                <TestCard position={testProblem.position} problem={testProblem.problem} collection={collection} solveAttempts={solveAttempts} permission={permission} authors={authors} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
