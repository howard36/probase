declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;

      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;

      INTERNAL_API_KEY: string;
    }
  }
}

export {}