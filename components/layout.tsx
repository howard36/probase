import Head from 'next/head';
import Script from 'next/script';
import Sidebar from './sidebar';
import { FC } from 'react';

interface LayoutProps {
  title: string;
}

const Layout: FC<LayoutProps> = ({ children, title = 'Probase' }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A math contest problem database" />
        <link rel="icon" href="/favicon.ico" />
        <title>{title}</title>
        <Script onLoad={() => {console.log("Script has loaded");}}></Script>
        
        {/* KaTeX */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css" />
      </Head>
      <Sidebar/>
      <main className="ml-64">{children}</main>
    </>
  );
}

export default Layout;
