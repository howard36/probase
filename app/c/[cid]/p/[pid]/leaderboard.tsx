import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SolveAttemptProps } from "./types";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

interface LeaderboardEntry {
  rank: number | null;
  name: string;
  solveTimeMillis: number | null;
  numFailed: number;
  highlight: boolean;
}

function formatTime(millis: number): string {
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

export default function Testsolve({
  solveAttempts,
  userId,
  canViewAll,
}: {
  solveAttempts: SolveAttemptProps[];
  userId: string;
  canViewAll: boolean;
}) {
  const numSolved = solveAttempts.filter(
    (attempt) => attempt.solvedAt !== null,
  ).length;
  const numAttempts = solveAttempts.length;

  const entries: LeaderboardEntry[] = solveAttempts.map((attempt) => {
    if (attempt.solvedAt !== null) {
      return {
        rank: null,
        name: attempt.user.name!,
        solveTimeMillis:
          attempt.solvedAt!.getTime() - attempt.startedAt.getTime(),
        numFailed: attempt.numSubmissions - 1,
        highlight: attempt.userId === userId,
      };
    } else {
      return {
        rank: null,
        name: attempt.user.name!,
        solveTimeMillis: null,
        numFailed: attempt.numSubmissions,
        highlight: attempt.userId === userId,
      };
    }
  });

  entries.sort((a, b) => {
    if (a.solveTimeMillis !== null && b.solveTimeMillis !== null) {
      if (a.numFailed !== b.numFailed) {
        return a.numFailed - b.numFailed;
      }
      return a.solveTimeMillis - b.solveTimeMillis;
    } else if (a.solveTimeMillis === null && b.solveTimeMillis === null) {
      return a.name.localeCompare(b.name);
    } else {
      return a.solveTimeMillis === null ? 1 : -1;
    }
  });

  // Set ranks. All non-solves have the same rank
  entries.forEach((entry, idx) => {
    if (entry.solveTimeMillis !== null) {
      entry.rank = idx + 1;
    }
  });

  // Non-admin users are restricted to only seeing the top 5
  const numShown = canViewAll ? numAttempts : Math.min(5, numSolved);
  const shownEntries = entries.filter(
    (entry, idx) => idx < numShown || entry.highlight,
  );

  return (
    <div className="my-12">
      <h2 className="mb-4 text-lg lg:text-2xl font-bold text-slate-900">
        Leaderboard
      </h2>
      <table className="min-w-full">
        <tbody className="">
          {shownEntries.map((entry, idx) => (
            <tr key={idx} className={entry.highlight ? "bg-yellow-100" : ""}>
              <td className="pr-3 py-3 whitespace-nowrap text-right w-12">
                {entry.rank}
                {entry.rank && "."}
              </td>
              <td className="py-3 whitespace-nowrap font-semibold">
                {entry.name}
              </td>
              <td className="py-3 whitespace-nowrap text-red-500">
                {(entry.numFailed > 0 || entry.solveTimeMillis === null) && (
                  <span>
                    <FontAwesomeIcon icon={faTimes} /> {entry.numFailed}
                  </span>
                )}
              </td>
              <td className="py-3 whitespace-nowrap text-green-500">
                {entry.solveTimeMillis && (
                  <span>
                    <FontAwesomeIcon icon={faCheck} />{" "}
                    {formatTime(entry.solveTimeMillis)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="my-4 text-slate-700 text-base">
        {numSolved} out of {numAttempts} testsolvers solved this problem
        {numShown < numSolved && ` (showing top ${numShown})`}
      </p>
    </div>
  );
}
