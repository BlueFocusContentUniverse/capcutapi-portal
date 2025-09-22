import type { AdapterAccountType } from "@auth/core/adapters";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/drizzle/db";
import { account, user } from "@/drizzle/schema";
import { hashPassword } from "@/lib/password";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rows = await db.select().from(user);

    const superAdmins = (process.env.SUPERADMINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const result = rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.email && superAdmins.includes(u.email) ? "superadmin" : "admin",
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Error fetching admin users:", err);
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow only superadmin role
    if (session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password } = body ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "'name' is required" },
        { status: 400 },
      );
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "'email' is required" },
        { status: 400 },
      );
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "'password' must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check uniqueness
    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    const hashed = await hashPassword(password);

    const result = await db.transaction(async (tx) => {
      const now = new Date();
      const [newUser] = await tx
        .insert(user)
        .values({ name, email, createdAt: now, updatedAt: now })
        .returning();

      await tx.insert(account).values({
        userId: newUser.id,
        type: "credentials" as AdapterAccountType,
        provider: "credentials",
        providerAccountId: email,
        access_token: hashed,
        createdAt: now,
        updatedAt: now,
      });

      return newUser;
    });

    return NextResponse.json(
      { id: result.id, name: result.name, email: result.email },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error creating user (admin):", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
