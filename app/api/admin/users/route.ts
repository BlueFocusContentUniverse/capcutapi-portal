import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/drizzle/db";
import { account, user } from "@/drizzle/schema/portal";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.email !== "super@admin.com") {
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
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow only superadmin role
    if (session.user.email !== "super@admin.com") {
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

    const result = await auth.api.createUser({
      body: {
        email,
        password,
        name,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Error creating user (admin):", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.email !== "super@admin.com") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "'id' is required" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      // Accounts have ON DELETE CASCADE, but explicitly clearing is fine
      await tx.delete(account).where(eq(account.userId, id));
      const deleted = await tx.delete(user).where(eq(user.id, id)).returning();
      return deleted[0];
    });

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Error deleting admin user:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
