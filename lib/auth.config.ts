/**
 * lib/auth.config.ts
 * Edge-compatible NextAuth configuration.
 *
 * This file MUST NOT import any Node.js-only modules (mongoose, bcryptjs, etc.)
 * because it is used by middleware.ts which runs in the Edge Runtime.
 *
 * The actual credential validation (DB lookup + bcrypt) is done in lib/auth.ts
 * which runs in the Node.js runtime (API routes, server components).
 */

import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    // Only declare the provider shape here — authorize() logic is in auth.ts
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize is intentionally omitted here (Edge-safe shell only)
      async authorize() {
        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    /**
     * authorized() — used by middleware to decide if the request is allowed.
     * Returns true if the user has a valid session.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Protect /dashboard
      if (pathname.startsWith("/dashboard")) {
        if (isLoggedIn) return true;
        return false; // Redirect to /login
      }

      // Redirect authenticated users away from /login and /register
      if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true; // All other routes are public
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.college = user.college;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        if (token.college) {
          session.user.college = token.college as string;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
