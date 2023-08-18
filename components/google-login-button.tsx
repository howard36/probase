'use client'

import { signIn } from "next-auth/react"

export default function GoogleLoginButton() {
  return <button onClick={() => signIn("google")}>Log in with Google</button>;
}
