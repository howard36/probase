import Link from "next/link";
import Title from "./title";
import Statement from "./statement";
import Spoilers from "./spoilers";
import Answer from "./answer";
import Solution from "./solution";
import AddSolution from "./add-solution";
import type { Props } from "./types";
import Comments from "./comments";
import ArchiveToggle from "./archive-toggle";
import Lightbulbs from "@/components/lightbulbs";
import Likes from "@/components/likes";
import LockedPage from "./locked-page";
import Testsolve from "./testsolve";
import Leaderboard from "./leaderboard";
import { canEditProblem } from "@/lib/permissions";
import { problemView } from "./view";
import BackButton from "@/components/back-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Filter, filterToString } from "@/lib/filter";

// darker color first, for more contrast
const subjectToGradient = {
  Algebra: {
    subject: "Algebra",
    gradient: "from-blue-500 to-indigo-500",
  },
  Combinatorics: {
    subject: "Combinatorics",
    gradient: "from-amber-500 to-orange-400",
  },
  Geometry: {
    subject: "Geometry",
    gradient: "from-green-500 to-emerald-500",
  },
  NumberTheory: {
    subject: "Number Theory",
    gradient: "from-rose-500 to-red-500",
  },
};

function convertToSlug(name: string) {
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, "") // Remove special characters except hyphens
    .replace(/\-+/g, "-"); // Replace multiple hyphens with a single hyphen
}

interface PropsWithFilter extends Props {
  filter: Filter;
}

export default function ProblemPage(props: PropsWithFilter) {
  const { problem, collection, permission, userId, authors, filter } = props;

  const filterStr = filterToString(filter);
  const canEdit = canEditProblem(problem, permission, authors);
  const view = problemView(props);

  let written_by;
  if (
    problem.authors.length > 0 &&
    (collection.showAuthors || permission.accessLevel === "Admin")
  ) {
    written_by = (
      <p className="mb-8 text-right text-base italic text-slate-700">
        Written by {problem.authors[0].displayName}
      </p>
    );
  }

  const { subject, gradient } = subjectToGradient[problem.subject];

  let testsolveOrAnswers;
  if (view.kind === "locked") {
    testsolveOrAnswers = (
      <LockedPage
        problemId={problem.id}
        time={`${view.timeMinutes} minutes`}
        unsolved={view.unsolved}
      />
    );
  } else if (view.kind === "testsolving") {
    testsolveOrAnswers = (
      <div>
        <div className="mb-8">
          <Statement {...props} />
        </div>
        <hr className="my-8" />
        <Testsolve
          problemId={problem.id}
          deadline={view.deadline}
          answerFormat={collection.answerFormat}
        />
      </div>
    );
  } else {
    let answer = null;
    if (problem.answer !== null) {
      answer = (
        <div className="my-8">
          <Answer {...props} />
        </div>
      );
    }

    let solution = null;
    if (problem.solutions.length > 0) {
      solution = (
        <div className="my-8">
          <Solution
            solution={problem.solutions[0]}
            permission={permission}
            authors={authors}
          />
        </div>
      );
    } else if (authors.length > 0) {
      solution = (
        <AddSolution problemId={problem.id} authorId={authors[0].id} />
      );
    }

    testsolveOrAnswers = (
      <div>
        <div className="mb-4">
          <Statement {...props} />
        </div>
        {written_by}
        {answer === null && solution === null ? (
          <div className="py-8"></div>
        ) : (
          <Spoilers>
            {answer}
            {solution}
          </Spoilers>
        )}
        {collection.requireTestsolve && (
          <Leaderboard
            solveAttempts={problem.solveAttempts}
            userId={userId}
            canViewAll={canEdit}
          />
        )}
        <Comments problemId={problem.id} comments={problem.comments} />
      </div>
    );
  }

  const currentPid = problem.pid;
  const nextPid = incrementPid(currentPid);
  const prevPid = decrementPid(currentPid);

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mb-8 inline-block sm:mb-16">
        <BackButton
          href={`/c/${collection.cid}${filterStr}`}
          label={`Back to ${collection.name}`}
        />
      </div>
      <div className="mx-auto w-112 max-w-full text-base sm:w-128 sm:text-lg md:w-144 md:text-xl">
        <div className="flex gap-8">
          <div className="flex-grow">
            <div className="mb-4 text-xl font-bold md:text-2xl">
              <Title {...props} />
            </div>
            <div className="mb-6 flex flex-wrap gap-x-3 gap-y-2 text-sm font-semibold">
              <Link
                href={`/c/${collection.cid}?subject=${subject.charAt(0).toLowerCase()}`}
                className={`whitespace-nowrap rounded-full bg-gradient-to-br px-6 py-2 text-center leading-none text-white ${gradient}`}
                prefetch={true}
              >
                {subject}
              </Link>
              {problem.testProblems.map((testProblem) => (
                <Link
                  href={`/c/${collection.cid}/t/${convertToSlug(
                    testProblem.test.name,
                  )}-${testProblem.test.id}`}
                  prefetch={true}
                  className="whitespace-nowrap rounded-full bg-slate-200 px-6 py-2 text-center leading-none text-slate-700 hover:bg-slate-300 hover:text-slate-800"
                  key={testProblem.test.id}
                >
                  {testProblem.test.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-2 space-y-3 text-base">
            <Likes
              problem={{ id: problem.id, likes: problem.likes }}
              userId={userId}
            />
            {problem.difficulty !== null && problem.difficulty > 0 && (
              <Lightbulbs difficulty={problem.difficulty} />
            )}
          </div>
        </div>

        {testsolveOrAnswers}
        {canEdit && (
          <div className="mt-8">
            <ArchiveToggle
              problemId={problem.id}
              isArchived={problem.isArchived}
            />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          {prevPid === null ? (
            <button
              disabled
              className="flex cursor-not-allowed items-center rounded px-4 py-2 text-sm font-bold text-slate-300 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Previous
            </button>
          ) : (
            <Link
              href={`/c/${collection.cid}/p/${prevPid}${filterStr}`}
              className="flex items-center rounded px-4 py-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-700"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Previous
            </Link>
          )}
          <Link
            href={`/c/${collection.cid}/p/${nextPid}${filterStr}`}
            className="flex items-center rounded px-4 py-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-700"
          >
            Next
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function incrementPid(pid: string): string {
  const letter = pid.charAt(0);
  const number = parseInt(pid.slice(1), 10);
  return `${letter}${number + 1}`;
}

function decrementPid(pid: string): string | null {
  const letter = pid.charAt(0);
  const number = parseInt(pid.slice(1), 10);
  if (number <= 1) {
    return null;
  }
  return `${letter}${number - 1}`;
}
