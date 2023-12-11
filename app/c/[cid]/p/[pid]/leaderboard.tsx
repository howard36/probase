import Label from "@/components/label";
import { SolveAttemptProps } from "./types";

interface LeaderboardEntry {
  name: string;
  solveTimeMillis: number | null;
  numFailed: number;
  highlight: boolean;
}

function formatTime(millis: number): string {
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

export default function Testsolve({
  solveAttempts,
  userId,
}: {
  solveAttempts: SolveAttemptProps[];
  userId: string;
}) {
  let entries: LeaderboardEntry[] = solveAttempts
    .filter(attempt => attempt.solvedAt !== null)
    .map(attempt => {
      return {
        name: attempt.user.name!,
        solveTimeMillis: attempt.solvedAt!.getTime() - attempt.startedAt.getTime(),
        numFailed: attempt.numSubmissions - 1,
        highlight: attempt.userId === userId,
      };
    });
  const numSolved = entries.length;
  entries.sort((a, b) => a.solveTimeMillis! - b.solveTimeMillis!);
  const topEntries = entries.slice(0, 3);

  const selfAttempt = solveAttempts.find(attempt => attempt.userId === userId);
  if (selfAttempt !== undefined && !topEntries.some(entry => entry.highlight)) {
    if (selfAttempt.solvedAt) {
      entries.push({
        name: selfAttempt.user.name!,
        solveTimeMillis: selfAttempt.solvedAt!.getTime() - selfAttempt.startedAt.getTime(),
        numFailed: selfAttempt.numSubmissions - 1,
        highlight: selfAttempt.userId === userId,
      });
    } else {
      entries.push({
        name: selfAttempt.user.name!,
        solveTimeMillis: null,
        numFailed: selfAttempt.numSubmissions,
        highlight: true,
      });
    }
  }

  return (
    <div className="my-8">
      <h2 className="mb-4 text-lg lg:text-2xl font-bold text-slate-900">Leaderboard</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry, idx) => (
            <tr key={idx} className={entry.highlight ? "bg-yellow-100" : ""}>
              <td className="px-6 py-3 whitespace-nowrap">{(idx < 3 ? idx : numSolved) + 1}. {entry.name}</td>
              <td className="px-6 py-3 whitespace-nowrap text-red-500">✖ {entry.numFailed}</td>
              <td className="px-6 py-3 whitespace-nowrap text-green-500">
                {entry.solveTimeMillis &&
                  <span>✔ {formatTime(entry.solveTimeMillis)}</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
