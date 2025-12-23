import { NextRequest, NextResponse } from "next/server";

import { jyApi } from "@/lib/serverService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const worker_name = searchParams.get("worker_name");
    const limit = searchParams.get("limit");

    const params = new URLSearchParams();
    if (worker_name) params.set("worker_name", worker_name);
    if (limit) params.set("limit", limit);

    const res = await jyApi.get(
      `api/worker-status/failure-logs?${params.toString()}`,
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(
      "[worker-status/failure-logs] Failed to fetch failure logs:",
      error,
    );
    return NextResponse.json(
      { error: "Failed to fetch failure logs" },
      { status: 500 },
    );
  }
}
