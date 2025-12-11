import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rows = await auth.api.listUsers({
      query: {
        limit: 100,
      },
      headers: request.headers,
    });

    const result = rows.users?.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
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

    if (session.user.role !== "admin") {
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

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "'id' is required" }, { status: 400 });
    }

    const result = await auth.api.removeUser({
      body: {
        userId: id,
      },
      headers: request.headers,
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

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, password } = body ?? {};

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "'id' is required" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "'password' must be at least 6 characters" },
        { status: 400 },
      );
    }

    console.log("id", id);
    console.log("password", password);
    console.log("request.headers", request.headers);

    const result = await auth.api.setUserPassword({
      body: {
        newPassword: password,
        userId: id,
      },
      headers: request.headers,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Error changing password:", err);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
