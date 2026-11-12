export type AppEnvironment = "dev" | "staging" | "test" | "local";

export interface Env {
  APP_ENV?: AppEnvironment;
  DB?: D1Database;
  MEDIA?: R2Bucket;
  ASSETS?: {
    fetch(request: Request): Promise<Response>;
  };
}
