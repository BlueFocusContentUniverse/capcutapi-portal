import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

import { db } from "./drizzle/db";
import {
  account,
  passkey as passkeySchema,
  session,
  user,
  verification,
} from "./drizzle/schema/portal";

export const auth = betterAuth({
  plugins: [
    username(),
    passkey(),
    admin({
      defaultRole: "admin",
      adminRoles: ["admin", "superadmin"],
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
