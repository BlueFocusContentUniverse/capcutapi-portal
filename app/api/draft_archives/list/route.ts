import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get environment variables
    const baseUrl = process.env.JYAPI_BASEURL;
    const apiToken = process.env.DRAFT_API_TOKEN;

    if (!baseUrl) {
      console.error("JYAPI_BASEURL environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (!apiToken) {
      console.error("DRAFT_API_TOKEN environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

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

    // Construct the external API URL
    const externalApiUrl = `${baseUrl}/api/draft_archives/list?${queryParams.toString()}`;

    console.log("Fetching draft archives from:", externalApiUrl);

    // Get authorization header from request
    const authHeader = request.headers.get("Authorization");

    // Call the external API with authorization
    const response = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader || `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Draft archives not found" },
          { status: 404 },
        );
      }

      const errorText = await response.text();
      console.error(`External API error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: "Failed to fetch draft archives from external API" },
        { status: response.status },
      );
    }

    // Get the JSON response from the external API
    const data = await response.json();

    // Return the API response directly
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error calling external API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
