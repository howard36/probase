import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { JWT } from "next-auth/jwt"
import type { User, Account, Profile, Session, NextAuthOptions } from "next-auth"
import type { AdapterUser } from "next-auth/adapters"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from '@/utils/prisma'

interface jwtCallbackParams {
  token: JWT;
  user?: User | AdapterUser;
  account?: Account | null;
  profile?: Profile;
  isNewUser?: boolean;
}

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

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT) {
  if (token.refreshToken === undefined) {
    console.error("called refreshAccessToken without a refreshToken");
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
  try {
    const url: string =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // console.
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: refreshedTokens.expires_at,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.log("Refresh Token Error:", error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// TODO: https://next-auth.js.org/tutorials/refresh-token-rotation
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: GOOGLE_AUTHORIZATION_URL,
      httpOptions: {
        timeout: 60000,
      },
      allowDangerousEmailAccountLinking: true,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }: jwtCallbackParams) {
      // console.log("In jwt callback", { token, user, account, profile, isNewUser }, "\n");
      // Initial sign in
      if (user && account && profile) {
        console.log("NEW USER!")
        // console.log({user})
        token.accessToken = account.access_token;
        token.provider = account.provider;
        token.type = account.type;
        token.emailVerified = profile.email_verified ?? false;
        
        if (account.provider === 'google') {
          token.givenName = profile.given_name;
          token.familyName = profile.family_name;
          token.locale = profile.locale;
          token.accessTokenExpires = account.expires_at;
          token.refreshToken = account.refresh_token;
        }

        // Save permission info in JWT
        const permissions = await prisma.permission.findMany({
          where: { userId: token.sub },
          select: {
            collection: {
              select: {
                cid: true,
                id: true,
              }
            },
            accessLevel: true,
          },
        });
        token.collectionPerms = permissions.map(permission => ({
          colId: permission.collection.id,
          cid: permission.collection.cid,
          isAdmin: permission.accessLevel === "Admin",
        }));

        token.authors = await prisma.author.findMany({
          where: { userId: token.sub }
        });

        return token;
      }

      // TODO: this prevents the saved token from being udpated
      // Return previous token if the access token has not expired yet
      if (token.provider === 'google') {
        if (token.accessTokenExpires) {
          // convert from milliseconds to seconds, add 10 second buffer
          if (Date.now() / 1000 + 10 < token.accessTokenExpires) {
            return token;
          }
        }
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }: sessionCallbackParams) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.emailVerified = token.emailVerified;
      session.givenName = token.givenName;
      session.familyName = token.familyName;
      session.locale = token.locale;
      session.user_id = token.sub;
      session.collectionPerms = token.collectionPerms;
      session.authors = token.authors;
      session.fullName = token.name;
      return session;
    },
  },

  session: {
    strategy: "jwt" as const,
  },
  theme: {
    colorScheme: "auto" as const,
  },
};

export default NextAuth(authOptions);