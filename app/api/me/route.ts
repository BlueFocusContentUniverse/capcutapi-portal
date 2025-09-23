import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/drizzle/db";
import { account, user } from "@/drizzle/schema";
import { hashPassword } from "@/lib/password";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, password } = body ?? {};

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        { error: "'name' must be string" },
        { status: 400 },
      );
    }
    if (password !== undefined) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          { error: "'password' must be at least 6 characters" },
          { status: 400 },
        );
      }
    }

    const userId = session.user.id;

    const result = await db.transaction(async (tx) => {
      if (name && name.trim()) {
        await tx
          .update(user)
          .set({ name: name.trim(), updatedAt: new Date() })
          .where(eq(user.id, userId));
      }

      if (password) {
        const hashed = await hashPassword(password);
        await tx
          .update(account)
          .set({ access_token: hashed, updatedAt: new Date() })
          .where(
            and(
              eq(account.userId, userId),
              eq(account.provider, "credentials"),
            ),
          );
      }

      const [updated] = await tx
        .select({ id: user.id, name: user.name, email: user.email })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      return updated;
    });

    return NextResponse.json(result ?? { ok: true }, { status: 200 });
  } catch (err) {
    console.error("Error updating profile:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
