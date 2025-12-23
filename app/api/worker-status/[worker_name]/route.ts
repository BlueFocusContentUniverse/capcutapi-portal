import { NextRequest, NextResponse } from "next/server";

import { jyApi } from "@/lib/serverService";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ worker_name: string }> },
) {
  try {
    const { worker_name } = await params;
    const res = await jyApi.delete(`api/worker-status/${worker_name}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(
      "[worker-status/[worker_name]] Failed to delete worker:",
      error,
    );
    return NextResponse.json(
      { error: "Failed to delete worker" },
      { status: 500 },
    );
  }
}
