import { NextRequest, NextResponse } from "next/server";

import { jyApi } from "@/lib/service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ archive_id: string }> },
) {
  try {
    const { archive_id } = await params;

    console.log("Deleting draft archive:", archive_id);

    const response = await jyApi.delete(
      `api/draft_archives/delete/${archive_id}`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Archive not found" },
          { status: 404 },
        );
      }

      const errorText = await response.text().catch(() => "");
      console.error(`External API error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: "Failed to delete archive from external API" },
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
