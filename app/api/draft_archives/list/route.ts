import { NextRequest, NextResponse } from "next/server";

import { jyApi } from "@/lib/serverService";

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const draft_id = searchParams.get("draft_id");
    const user_id = searchParams.get("user_id");
    const page = searchParams.get("page") || "1";
    const page_size = searchParams.get("page_size") || "100";

    // Build query string for external API
    const queryParams = new URLSearchParams();
    if (draft_id) queryParams.set("draft_id", draft_id);
    if (user_id) queryParams.set("user_id", user_id);
    queryParams.set("page", page);
    queryParams.set("page_size", page_size);

    console.log("Fetching draft archives with params:", queryParams.toString());

    const response = await jyApi.get(
      `api/draft_archives/list?${queryParams.toString()}`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Draft archives not found" },
          { status: 404 },
        );
      }

      const errorText = await response.text().catch(() => "");
      console.error(`External API error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: "Failed to fetch draft archives from external API" },
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
