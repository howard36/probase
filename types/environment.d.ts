declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_CLUSTER_NAME: string;
      MONGODB_DB_NAME: string;
      MONGODB_APP_ID: string;
      MONGODB_API_KEY: string;

      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;

      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
    }
  }
}

export {}