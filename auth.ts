import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthConfig, User, Session } from "next-auth";
import type { JWT } from "@auth/core/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AdapterUser } from "@auth/core/adapters";
import prisma from "@/utils/prisma";

interface sessionCallbackParams {
  session: Session;
  user: User | AdapterUser;
  token: JWT;
}

const GOOGLE_AUTHORIZATION_URL: string =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
  });

// TODO: https://next-auth.js.org/tutorials/refresh-token-rotation
const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: GOOGLE_AUTHORIZATION_URL,
      allowDangerousEmailAccountLinking: true, // Note: don't do this for Discord
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
      account,
      profile,
    }) {
      if (user && account && profile) {
        // Initial sign in
        // when trigger is "signIn" or "signUp", token contains a subset of JWT.
        // `name`, `email` and `picture` will be included.
        token.accessToken = account.access_token;
        token.provider = account.provider;
        token.type = account.type;
        token.emailVerified = profile.email_verified ?? false;

        if (account.provider === "google") {
          // profile changes depending on which account you use to log in
          token.givenName = profile.given_name ?? "";
          token.familyName = profile.family_name ?? "";
          token.locale = profile.locale;
          token.currentEmail = profile.email;
          token.accessTokenExpires = account.expires_at;
          token.refreshToken = account.refresh_token;
        }
      }
      return token;
    },
    async session({ session, token }: sessionCallbackParams) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.currentEmail = token.currentEmail;
      session.emailVerified = token.emailVerified;
      session.fullName = token.name;
      session.givenName = token.givenName;
      session.familyName = token.familyName;
      session.locale = token.locale;
      session.userId = token.sub;
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
  theme: {
    colorScheme: "auto",
  },
};

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth(authOptions)
