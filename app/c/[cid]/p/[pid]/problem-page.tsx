import Link from "next/link";
import Title from "./title";
import Statement from "./statement";
import Spoilers from "./spoilers";
import type { Props } from "./types";
import Comments from "./comments";
import ArchiveToggle from "./archive-toggle";
import Lightbulbs from "@/components/lightbulbs";
import Likes from "@/components/likes";
import LockedPage from "./locked-page";
import Testsolve from "./testsolve";
import Leaderboard from "./leaderboard";
import { canEditProblem } from "@/lib/permissions";
import BackButton from "@/components/back-button";

// darker color first, for more contrast
const subjectToGradient = {
  Algebra: {
    subject: "Algebra",
    gradient: "from-blue-500 to-sky-500",
  },
  Combinatorics: {
    subject: "Combinatorics",
    gradient: "from-orange-500 to-amber-500",
  },
  Geometry: {
    subject: "Geometry",
    gradient: "from-emerald-500 to-green-500",
  },
  NumberTheory: {
    subject: "Number Theory",
    gradient: "from-violet-500 to-purple-500",
  },
};

function convertToSlug(name: string) {
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, "") // Remove special characters except hyphens
    .replace(/\-+/g, "-"); // Replace multiple hyphens with a single hyphen
}

export default function ProblemPage(props: Props) {
  const { problem, collection, permission, userId, authors } = props;

  let written_by;
  if (
    problem.authors.length > 0 &&
    (collection.showAuthors || permission.accessLevel === "Admin")
  ) {
    written_by = (
      <p className="italic text-slate-700 text-base mb-8 text-right">
        Written by {problem.authors[0].displayName}
      </p>
    );
  }

  const { subject, gradient } = subjectToGradient[problem.subject];

  // TODO: make this a separate Testsolving component
  let testsolveOrAnswers;
  if (
    collection.requireTestsolve &&
    !canEditProblem(problem, permission, authors)
  ) {
    const difficulty = problem.difficulty;
    if (difficulty === null || difficulty === 0) {
      throw new Error(
        "Difficulty is null or zero, cannot determine testsolve time",
      );
    }
    const testsolveTimeMinutes = difficulty * 5 + 5; // 10, 15, 20, 25, 30

    const solveAttempt = problem.solveAttempts.find(
      (attempt) => attempt.userId === userId,
    );
    if (solveAttempt === undefined) {
      testsolveOrAnswers = (
        <LockedPage
          problem={problem}
          time={`${testsolveTimeMinutes} minutes`}
          unsolved={problem.solveAttempts.every(
            (attempt) => attempt.solvedAt === null,
          )}
        />
      );
    } else {
      const testsolveTimeMillis = testsolveTimeMinutes * 60 * 1000;
      const deadline = new Date(
        solveAttempt.startedAt.getTime() + testsolveTimeMillis,
      );
      const finished =
        new Date() >= deadline ||
        solveAttempt.gaveUp ||
        solveAttempt.solvedAt !== null;

      if (finished) {
        // TODO: move this into a component
        testsolveOrAnswers = (
          <div>
            <div className="mb-4">
              <Statement {...props} />
            </div>
            {written_by}
            <Spoilers {...props} />
            {collection.requireTestsolve && (
              <Leaderboard
                solveAttempts={problem.solveAttempts}
                userId={userId}
                canViewAll={canEditProblem(problem, permission, authors)}
              />
            )}
            <Comments {...props} />
          </div>
        );
      } else {
        // Currently testsolving
        // TODO: show timer, input box, give up button
        testsolveOrAnswers = (
          <div>
            <div className="mb-8">
              <Statement {...props} />
            </div>
            <hr className="my-8" />
            <Testsolve
              problem={problem}
              solveAttempt={solveAttempt}
              deadline={deadline}
            />
          </div>
        );
      }
    }
  } else {
    testsolveOrAnswers = (
      <div>
        <div className="mb-4">
          <Statement {...props} />
        </div>
        {written_by}
        <Spoilers {...props} />
        {collection.requireTestsolve && (
          <Leaderboard
            solveAttempts={problem.solveAttempts}
            userId={userId}
            canViewAll={canEditProblem(problem, permission, authors)}
          />
        )}
        <Comments {...props} />
      </div>
    );
  }

  return (
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="mb-8 sm:mb-16 inline-block">
        <BackButton
          href={`/c/${collection.cid}`}
          label={`Back to ${collection.name}`}
        />
      </div>
      <div className="mx-auto w-112 sm:w-128 md:w-144 max-w-full text-base sm:text-lg md:text-xl">
        <div className="flex gap-8">
          <div className="flex-grow">
            <div className="text-2xl sm:text-3xl text-slate-900 font-bold mb-4">
              <Title {...props} />
            </div>
            <div className="mb-6 font-semibold text-sm flex flex-wrap gap-x-3 gap-y-2">
              <Link
                href={`/c/${collection.cid}?subject=${subject.charAt(0).toLowerCase()}`}
                className={`py-2 px-6 text-slate-50 text-center leading-none rounded-full whitespace-nowrap bg-gradient-to-r ${gradient}`}
              >
                {subject}
              </Link>
              {problem.testProblems.map((testProblem) => (
                <Link
                  href={`/c/${collection.cid}/t/${convertToSlug(
                    testProblem.test.name,
                  )}-${testProblem.test.id}`}
                  prefetch={true}
                  className="py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-800 text-center leading-none rounded-full whitespace-nowrap"
                  key={testProblem.test.id}
                >
                  {testProblem.test.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-base space-y-3 mt-2">
            <Likes problem={problem} userId={userId} />
            {problem.difficulty !== null && problem.difficulty > 0 && (
              <Lightbulbs difficulty={problem.difficulty} />
            )}
          </div>
        </div>

        {/* Statement should also be hidden if they haven't clicked "Start testsolve" */}
        {testsolveOrAnswers}

        {permission?.accessLevel === "Admin" && (
          <div>
            <ArchiveToggle {...props} />
          </div>
        )}
      </div>
    </div>
  );
}
