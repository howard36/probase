import { AccessLevel } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    email?: string | null;
    emailVerified: bool;
    currentEmail?: string | null;
    fullName?: string | null;
    givenName?: string;
    familyName?: string;
    locale?: string | null;
    userId?: string;
  }

  interface Profile {
    email_verified?: bool;
    given_name?: string;
    family_name?: string;
    locale?: string;
  }
}

declare module "@auth/core/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken?: string;
    provider?: string;
    type?: string;

    emailVerified?: boolean;
    givenName?: string;
    familyName?: string;
    locale?: string | null;
    currentEmail?: string | null;
    accessTokenExpires?: number;
    refreshToken?: string;
  }
}
