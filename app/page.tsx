import Sidebar from '@/components/sidebar'
import Link from 'next/link';

export default function HomePage() {
  return (
    <Sidebar>
      <div className="p-4 pt-8 sm:p-24 text-base sm:text-lg">
        <h1 className="text-3xl font-semibold mb-4">Welcome to Probase!</h1>
        <p className="mb-3">There&apos;s not much here yet, but you can check out the <Link href="/demo" prefetch={true} className="text-sky-600 hover:underline">demo</Link> or the <Link href="https://github.com/howard36/probase" prefetch={true} className="text-sky-600 hover:underline">Github repo</Link>.</p>
        <p>There are also links to private collections on the left, if you have access to them.</p>
      </div>
    </Sidebar>
  );
}
