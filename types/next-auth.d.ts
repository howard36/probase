import { AccessLevel } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

interface CollectionPerm {
  collectionId: number;
  accessLevel: AccessLevel;
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    emailVerified: bool;
    givenName?: string;
    familyName?: string;
    locale?: string;
    user_id?: string;
    // collectionPerms?: CollectionPerm[];
    viewColPerms: string[];
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
    accessTokenExpires?: number;
    refreshToken?: string;

    // collectionPerms?: CollectionPerm[];
    viewColPerms: string[];
  }
}