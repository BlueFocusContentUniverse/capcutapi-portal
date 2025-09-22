"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type React from "react";

export function SessionProvider({
  children,
  basePath,
}: {
  children: React.ReactNode;
  basePath?: string;
}) {
  return (
    <NextAuthSessionProvider basePath={basePath}>
      {children}
    </NextAuthSessionProvider>
  );
}
