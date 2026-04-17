/**
 * app/api/auth/[...nextauth]/route.ts
 * NextAuth v5 route handler.
 * Exports GET and POST so NextAuth can handle all /api/auth/* requests:
 *   - /api/auth/signin
 *   - /api/auth/signout
 *   - /api/auth/session
 *   - /api/auth/callback/credentials
 *   - etc.
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
