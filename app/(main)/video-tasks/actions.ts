"use server";

interface ArchiveDraftRequest {
  draft_id: string;
  draft_folder: string;
  [property: string]: unknown;
}

async function archiveDraft(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const baseUrl = process.env.JYAPI_BASEURL;
  if (!baseUrl) {
    console.error("JYAPI_BASEURL is not set");
    return { ok: false, error: "JYAPI_BASEURL is not set" };
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

  const payload: ArchiveDraftRequest = {
    draft_id,
    draft_folder,
  };

  try {
    const res = await fetch(`${baseUrl}/archive_draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("archive_draft failed:", res.status, text);
      return { ok: false, error: text || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("archive_draft request error:", err);
    return { ok: false, error: "Request error" };
  }
}

export async function archiveDraftAction(
  _prevState: unknown,
  formData: FormData,
) {
  "use server";
  return archiveDraft(formData);
}
