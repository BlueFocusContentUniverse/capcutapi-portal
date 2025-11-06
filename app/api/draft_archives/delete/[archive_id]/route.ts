import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ archive_id: string }> },
) {
  try {
    const { archive_id } = await params;

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

    // Construct the external API URL
    const externalApiUrl = `${baseUrl}/api/draft_archives/delete/${archive_id}`;

    console.log("Deleting draft archive from:", externalApiUrl);

    // Get authorization header from request
    const authHeader = request.headers.get("Authorization");

    // Call the external API with authorization
    const response = await fetch(externalApiUrl, {
      method: "DELETE",
      headers: {
        Authorization: authHeader || `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Archive not found" },
          { status: 404 },
        );
      }

      const errorText = await response.text();
      console.error(`External API error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: "Failed to delete archive from external API" },
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
