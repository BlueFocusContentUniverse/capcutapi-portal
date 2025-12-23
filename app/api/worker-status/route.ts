import { NextResponse } from "next/server";

import { jyApi } from "@/lib/serverService";

export async function GET() {
  try {
    const res = await jyApi.get("api/worker-status");
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[worker-status] Failed to fetch worker status:", error);
    return NextResponse.json(
      { error: "Failed to fetch worker status" },
      { status: 500 },
    );
  }
}
