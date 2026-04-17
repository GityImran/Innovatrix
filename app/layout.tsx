/**
 * app/layout.tsx
 * Root layout — wraps the entire app with the NextAuth SessionProvider
 * so that client components can use useSession() anywhere.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Circular Campus Economy",
  description:
    "Reimagining campus resources. Reduce waste, save money, and build a circular mindset aligned with Mission LiFE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
         * SessionProvider makes the session available to all client components
         * via useSession(). It does NOT affect server components (those use auth() directly).
         */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
