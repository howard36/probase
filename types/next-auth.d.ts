import { AccessLevel } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Prisma } from "@prisma/client"

interface CollectionPerm {
  colId: number;
  cid: string;
  isAdmin: boolean;
}

const authorPerm = Prisma.validator<Prisma.AuthorArgs>()({
  select: {
    id: true,
    collectionId: true,
  }
});
type AuthorPerm = Prisma.AuthorGetPayload<typeof authorPerm>;

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    email?: string | null;
    emailVerified: bool;
    currentEmail?: string;
    fullName?: string | null;
    givenName?: string;
    familyName?: string;
    locale?: string;
    userId?: string;
    collectionPerms: CollectionPerm[];
    authors: AuthorPerm[];
  }

  interface Profile {
    email_verified?: bool;
    given_name?: string;
    family_name?: string;
    locale?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken?: string;
    provider?: string;
    type?: string;

    emailVerified?: boolean;
    givenName?: string;
    familyName?: string;
    locale?: string;
    currentEmail?: string;
    accessTokenExpires?: number;
    refreshToken?: string;

    collectionPerms: CollectionPerm[];
    authors: AuthorPerm[];
  }
}