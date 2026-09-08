import Link from "next/link";
import Sidebar from "@/components/sidebar";

export default function NotFoundPage() {
  return (
    <Sidebar>
      <div className="mx-auto my-24 w-128 max-w-full px-8">
        <h1 className="mb-8 text-3xl">Page not found</h1>
        <p className="mb-8 text-xl">
          This page does not exist, or the problem or collection was removed.
        </p>
        <Link
          href="/"
          prefetch={true}
          className="rounded bg-violet-500 px-4 py-2 font-bold text-white hover:bg-violet-600"
        >
          Back to home
        </Link>
      </div>
    </Sidebar>
  );
}
