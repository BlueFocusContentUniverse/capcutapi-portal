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
    const { name, email, oldPassword, password } = body ?? {};

    const updateData: { name?: string; email?: string } = {};

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        { error: "'name' must be string" },
        { status: 400 },
      );
    }
    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string") {
        return NextResponse.json(
          { error: "'email' must be string" },
          { status: 400 },
        );
      }
      if (email.trim() && email !== session.user.email) {
        updateData.email = email.trim();
      }
    }

    if (Object.keys(updateData).length > 0) {
      await auth.api.updateUser({
        body: updateData,
        headers: request.headers,
      });
    }

    if (password !== undefined && password !== null && password !== "") {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          { error: "'password' must be at least 6 characters" },
          { status: 400 },
        );
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
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Error updating profile:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
