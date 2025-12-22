"use server";

import { jyApi } from "@/lib/serverService";

type WorkerStatus = {
  worker_name: string;
  hostname?: string | null;
  is_available: boolean;
  last_heartbeat?: number | null;
  last_failure_at?: number | null;
  last_failure_reason?: string | null;
  last_failure_task_id?: string | null;
  failure_count?: number | null;
  extra?: unknown;
  updated_at?: number | null;
};

type WorkerStatusResponse = {
  total_workers: number;
  available_workers: number;
  workers: WorkerStatus[];
};

export async function fetchWorkerStatus(): Promise<WorkerStatusResponse | null> {
  try {
    const res = await jyApi.get("api/worker-status");

    if (!res.ok) {
      console.error("[worker-status] API returned error:", res.status);
      return null;
    }

    const data = (await res.json()) as WorkerStatusResponse;
    return data;
  } catch (error) {
    console.error("[worker-status] Failed to fetch worker status:", error);
    return null;
  }
}
