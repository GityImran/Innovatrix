/**
 * types/next-auth.d.ts
 * Extends NextAuth's built-in types to include the custom `id` field
 * we attach to the session user in lib/auth.ts callbacks.
 *
 * Without this, TypeScript would complain that `session.user.id` doesn't exist.
 */

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Custom field added in the session callback
    } & DefaultSession["user"];
  }
}
