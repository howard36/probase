import { Metadata } from 'next'
import Providers from './providers'

import '../styles/globals.css'
import 'katex/dist/katex.min.css'

export const metadata: Metadata = {
  title: 'Probase',
  description: 'A math contest problem database',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-slate-50">
      {/*
      <link rel="icon" href="/favicon.ico" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css" />
      */}
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
