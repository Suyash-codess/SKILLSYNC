"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

/**
 * Global provider wrapper for Next.js app layout.
 * Includes NextAuth SessionProvider for client-side auth state.
 */
export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
