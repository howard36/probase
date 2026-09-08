import "next-auth";

declare module "next-auth" {
  /**
   * Returned by `auth()` on the server.
   */
  interface Session {
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
    provider?: string;
    type?: string;

    emailVerified?: boolean;
    givenName?: string;
    familyName?: string;
    locale?: string | null;
    currentEmail?: string | null;
  }
}
