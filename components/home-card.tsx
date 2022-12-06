import Link from 'next/link';

export default function HomeCard({ cid, problem }) {
  return (
    <Link href={`/c/${cid}/p/${problem.pid}`}>
      <div className="bg-white p-6 m-8 rounded-2xl soft-shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{problem.title}</h1>
        <p className="text-slate-700">{problem.statement}</p>
      </div>
    </Link>
  );
}
