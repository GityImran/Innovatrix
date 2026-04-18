import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req: NextRequest) => {
  const { nextUrl } = req;
  const userEmail = req.cookies.get("userEmail")?.value;

  // Admin access control for /dashboard/admin and sub-routes
  if (nextUrl.pathname.startsWith("/dashboard/admin")) {
    if (userEmail !== "admin@college.edu") {
      // If not the admin email, redirect to login
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
