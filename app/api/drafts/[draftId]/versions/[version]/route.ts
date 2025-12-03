import { NextRequest, NextResponse } from "next/server";

import { jyApi } from "@/lib/serverService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ draftId: string; version: string }> },
) {
  try {
    const { draftId, version } = await params;

    console.log("Fetching version data for:", draftId, "version:", version);

    const response = await jyApi.get(
      `api/drafts/${draftId}/versions/${version}`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Draft version not found" },
          { status: 404 },
        );
      }

      const errorText = await response.text().catch(() => "");
      console.error(`External API error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: "Failed to fetch draft version data from external API" },
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
