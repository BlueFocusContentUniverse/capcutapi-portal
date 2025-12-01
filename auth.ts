import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, username } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";

import { db } from "./drizzle/db";
import {
  account,
  passkey as passkeySchema,
  session,
  user,
  verification,
} from "./drizzle/schema/portal";
import { sendOTPEmail } from "./lib/email";

const superadminAc = createAccessControl({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
});

const superadminRole = superadminAc.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
});

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    username(),
    passkey(),
    admin({
      defaultRole: "user",
      adminRoles: ["admin", "superadmin"],
      roles: {
        superadmin: superadminRole,
      },
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      sendVerificationOTP: sendOTPEmail,
    }),
    nextCookies(),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      account: account,
      session: session,
      verification: verification,
      passkey: passkeySchema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
});
