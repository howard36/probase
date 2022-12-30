import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" className="bg-slate-50">
      <Head>
        <meta name="description" content="A math contest problem database" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
