import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <Head>
        <title>Probase</title>
        <meta name="description" content="A math contest problem database" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="text-6xl">
          Hello World
        </div>
      </main>
    </>
  )
}
