"use server";

import { headers } from "next/headers";

import { auth } from "@/auth";

interface ArchiveDraftRequest {
  draft_id: string;
  draft_folder: string;
  draft_version?: string;
  user_id?: string;
  user_name?: string;
}

async function saveDraft(
  formData: FormData,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const baseUrl = process.env.JYAPI_BASEURL;
  const apiToken = process.env.DRAFT_API_TOKEN;

  if (!baseUrl) {
    console.error("JYAPI_BASEURL is not set");
    return { ok: false, error: "JYAPI_BASEURL is not set" };
  }

  if (!apiToken) {
    console.error("DRAFT_API_TOKEN is not set");
    return { ok: false, error: "DRAFT_API_TOKEN is not set" };
  }

  // Get user session for authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { ok: false, error: "Authentication required" };
  }

  const draft_id = formData.get("draft_id");
  const draft_folder = formData.get("draft_folder");

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

  try {
    const res = await fetch(`${baseUrl}/save_draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("save_draft failed:", res.status, text);
      return { ok: false, error: text || `HTTP ${res.status}` };
    }

    const data = await res.json();

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
