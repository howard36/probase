'use client'

import LibLatex from 'react-latex-next'
import Katex from './katex';

export default function Latex({
  children
}: {
  children: string
}) {
  // return <LibLatex>{children}</LibLatex>;
  return <Katex>{children}</Katex>;
}
