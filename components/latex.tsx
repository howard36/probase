'use client'

import LibLatex from 'react-latex-next'

export default function Latex({
  children
}: {
  children: string
}) {
  return <LibLatex>{children}</LibLatex>;
}
