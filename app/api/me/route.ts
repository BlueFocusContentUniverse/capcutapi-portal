import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, oldPassword, password } = body ?? {};

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        { error: "'name' must be string" },
        { status: 400 },
      );
    }
    if (name && name.trim()) {
      await auth.api.updateUser({
        body: {
          name: name.trim(),
        },
        headers: request.headers,
      });
    }
    if (password !== undefined) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          { error: "'password' must be at least 6 characters" },
          { status: 400 },
        );
      }
    }

    const result = await auth.api.changePassword({
      body: {
        newPassword: password,
        currentPassword: oldPassword,
        revokeOtherSessions: true,
      },
      headers: request.headers,
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
