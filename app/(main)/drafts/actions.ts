"use server";

export interface GenerateVideoRequest {
  draft_id: string;
  framerate?: string;
  name?: string;
  resolution?: string;
  [property: string]: unknown;
}

export async function generateVideo(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const baseUrl = process.env.JYAPI_BASEURL;
  if (!baseUrl) {
    console.error("JYAPI_BASEURL is not set");
    return { ok: false, error: "JYAPI_BASEURL is not set" };
  }

  const draft_id = formData.get("draft_id");
  const framerate = formData.get("framerate");
  const name = formData.get("name");
  const resolution = formData.get("resolution");

  if (!draft_id || typeof draft_id !== "string") {
    console.error("draft_id is required");
    return { ok: false, error: "draft_id is required" };
  }

  const payload: GenerateVideoRequest = { draft_id };
  if (typeof framerate === "string" && framerate) {
    payload.framerate = framerate;
  }
  if (typeof name === "string" && name) {
    payload.name = name;
  }
  if (typeof resolution === "string" && resolution) {
    payload.resolution = resolution;
  }

  try {
    const res = await fetch(`${baseUrl}/generate_video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("generate_video failed:", res.status, text);
      return { ok: false, error: text || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("generate_video request error:", err);
    return { ok: false, error: "Request error" };
  }
}

export async function generateVideoAction(
  _prevState: unknown,
  formData: FormData,
) {
  "use server";
  return generateVideo(formData);
}
