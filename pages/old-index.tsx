import Head from 'next/head';
import Image from 'next/image';
import Sidebar from '@/components/sidebar';

export default function Home() {
  return (
    <Sidebar>
      <div className="text-6xl">
        Hello World
      </div>
    </Sidebar>
  );
}
