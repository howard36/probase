import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { User, Account, Profile, Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "@/utils/mongodb"

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
      error: "RefreshAccessTokenError1",
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

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: refreshedTokens.expires_at,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: "RefreshAccessTokenError2",
    };
  }
}

// TODO: https://next-auth.js.org/tutorials/refresh-token-rotation
export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: GOOGLE_AUTHORIZATION_URL,
      httpOptions: {
        timeout: 60000,
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }: jwtCallbackParams) {
      console.log("In jwt callback", { token, user, account, profile, isNewUser }, "\n");
      // Initial sign in
      if (account && profile) {
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
        return token;
      }

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
    async session({ session, user, token }: sessionCallbackParams) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.emailVerified = token.emailVerified;
      session.givenName = token.givenName;
      session.familyName = token.familyName;
      session.locale = token.locale;
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