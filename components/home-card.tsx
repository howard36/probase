import Link from 'next/link';
import Latex from 'react-latex-next';

export default function HomeCard({ contest, problem }) {
  return (
    <Link href={`/c/${contest.cid}/p/${problem.pid}`}>
      <div className="bg-white p-6 m-8 rounded-2xl soft-shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{problem.title}</h1>
        <p className="text-slate-700"><Latex>{problem.statement}</Latex></p>
      </div>
    </Link>
  );
}
