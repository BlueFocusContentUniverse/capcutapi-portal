"use server";

import { headers } from "next/headers";

import { auth } from "@/auth";
import { jyApi } from "@/lib/serverService";

type VideoTasksApiItem = {
  id: number;
  taskId: string;
  draftId: string;
  videoId: string | null;
  videoName: string | null;
  renderStatus: string;
  progress: number | null;
  message: string | null;
  extra: unknown | null;
  createdAt: number | null;
  updatedAt: number | null;
  ossUrl: string | null;
};

type VideoTasksApiResponse = {
  items: VideoTasksApiItem[];
  pagination?: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

interface ArchiveDraftRequest {
  draft_id: string;
  draft_folder: string;
  archive_name?: string;
  draft_version?: number;
  user_id?: string;
  user_name?: string;
}

async function saveDraft(
  formData: FormData,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  // Get user session for authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { ok: false, error: "Authentication required" };
  }

  const draft_id = formData.get("draft_id");
  const draft_folder = formData.get("draft_folder");
  const archive_name = formData.get("archive_name");
  const draft_version = formData.get("draft_version");

  if (!draft_id || typeof draft_id !== "string") {
    console.error("draft_id is required");
    return { ok: false, error: "draft_id is required" };
  }

  if (!draft_folder || typeof draft_folder !== "string") {
    console.error("draft_folder is required");
    return { ok: false, error: "draft_folder is required" };
  }

  const user_id = session.user.id;
  const user_name = session.user.name;

  const payload: ArchiveDraftRequest = {
    draft_id,
    draft_folder,
    user_id,
    user_name,
  };

  if (archive_name && typeof archive_name === "string") {
    payload.archive_name = archive_name;
  }

  if (draft_version && typeof draft_version === "string") {
    const parsedVersion = Number(draft_version);
    if (!isNaN(parsedVersion) && isFinite(parsedVersion)) {
      payload.draft_version = parsedVersion;
    }
  }

  try {
    const res = await jyApi.post("save_draft", {
      json: payload,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("save_draft failed:", res.status, text);
      return { ok: false, error: text || `HTTP ${res.status}` };
    }

    const data = await res.json<{ success: boolean; error?: string }>();

    if (!data.success) {
      console.error("save_draft API returned success: false", data.error);
      return { ok: false, error: data.error || "Archive request failed" };
    }

    // Archive task is now async - return success immediately
    // User can check the status in Draft Archives page
    return {
      ok: true,
      message:
        "Archive request submitted successfully. You can check the status in Draft Archives.",
    };
  } catch (err) {
    console.error("save_draft request error:", err);
    return { ok: false, error: "Request error" };
  }
}

export async function saveDraftAction(_prevState: unknown, formData: FormData) {
  "use server";
  return saveDraft(formData);
}

export async function fetchVideoTasksFromApi({
  page,
  pageSize,
  draftId,
  renderStatus,
  startDate,
  endDate,
}: {
  page: number;
  pageSize: number;
  draftId?: string;
  renderStatus?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const res = await jyApi.get("api/video-tasks", {
      searchParams: {
        page: String(page),
        page_size: String(pageSize),
        ...(draftId ? { draft_id: draftId } : {}),
        ...(renderStatus ? { render_status: renderStatus } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
      },
    });

    const data = (await res.json()) as VideoTasksApiResponse;

    const items: VideoTasksApiItem[] = (data.items ?? []).map((item) => ({
      ...item,
      createdAt: item.createdAt ? item.createdAt * 1000 : null,
      updatedAt: item.updatedAt ? item.updatedAt * 1000 : null,
    }));

    return {
      items,
      total: data.pagination?.total_count ?? items.length,
      totalPages: data.pagination?.total_pages,
    };
  } catch (error) {
    console.error("Failed to fetch video tasks from external API:", error);
    return { items: [], total: 0, totalPages: 1 };
  }
}
