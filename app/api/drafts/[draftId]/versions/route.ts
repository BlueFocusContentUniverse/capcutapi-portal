import { NextResponse } from "next/server";

import { jyApi } from "@/lib/serverService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ draftId: string }> },
) {
  try {
    const { draftId } = await params;

    console.log("Fetching draft versions for:", draftId);

    const response = await jyApi.get(`api/drafts/${draftId}/versions`);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
      }

      const errorText = await response.text().catch(() => "");
      console.error(`External API error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: "Failed to fetch draft versions from external API" },
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
