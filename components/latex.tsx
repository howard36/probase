'use client'

import Katex from './katex';

export default function Latex({
  children
}: {
  children: string
}) {
  return <Katex>{children}</Katex>;
}
