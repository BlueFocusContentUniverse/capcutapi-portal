import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { verifyPassword } from "@/lib/password";

import { db } from "./drizzle/db";
import { account, user } from "./drizzle/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: user,
    accountsTable: account,
  }),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim();
        const password = credentials?.password?.toString();
        if (!email || !password) return null;

        // Fetch the account row associated with this email for the "credentials" provider
        // We store the password hash in adminAccounts.access_token
        const rows = await db
          .select()
          .from(account)
          .leftJoin(user, eq(account.userId, user.id))
          .where(
            and(
              eq(account.provider, "credentials"),
              eq(account.providerAccountId, email),
            ),
          )
          .limit(1);

        const row = rows[0];
        if (!row || !row.account || !row.user) return null;

        const hashed = row.account.access_token;
        if (!hashed) return null;

        const isValid = await verifyPassword(password, hashed);
        if (!isValid) return null;

        // Mark superadmin if listed in env SUPERADMINS (comma-separated list of emails)
        const superAdmins = (process.env.SUPERADMINS ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const role = superAdmins.includes(email) ? "superadmin" : "admin";

        // return user object with profile data
        return {
          id: row.user.id,
          name: row.user.name ?? "管理员",
          email: row.user.email ?? email,
          role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 3 * 24 * 60 * 60, // 3 days
    updateAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
