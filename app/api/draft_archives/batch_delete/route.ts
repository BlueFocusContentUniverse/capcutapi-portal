import { NextRequest, NextResponse } from "next/server";

import { jyApi } from "@/lib/serverService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { archive_ids } = body;

    if (
      !archive_ids ||
      !Array.isArray(archive_ids) ||
      archive_ids.length === 0
    ) {
      return NextResponse.json(
        { error: "archive_ids array is required and must not be empty" },
        { status: 400 },
      );
    }

    console.log("Batch deleting draft archives:", archive_ids);

    const response = await jyApi.delete("api/draft_archives/batch_delete", {
      json: { archive_ids },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`External API error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: "Failed to delete archives from external API" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error calling external API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
