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

type FailureLog = {
  id: number;
  worker_name: string;
  task_id?: string | null;
  failure_reason: string;
  created_at: number;
};

type FailureLogsResponse = {
  total_logs: number;
  logs: FailureLog[];
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

export async function deleteWorker(
  workerName: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await jyApi.delete(`api/worker-status/${workerName}`);
    if (!res.ok) {
      console.error("[worker-status] API returned error:", res.status);
      return {
        success: false,
        message: `Failed to delete worker ${workerName}`,
      };
    }

    const data = (await res.json()) as { success: boolean; message: string };
    return data;
  } catch (error) {
    console.error("[worker-status] Failed to delete worker:", error);
    return {
      success: false,
      message: `Failed to delete worker ${workerName}`,
    };
  }
}

export async function fetchFailureLogs(
  workerName?: string,
  limit?: number,
): Promise<FailureLogsResponse | null> {
  try {
    const params = new URLSearchParams();
    if (workerName) params.set("worker_name", workerName);
    if (limit) params.set("limit", limit.toString());

    const res = await jyApi.get(
      `api/worker-status/failure-logs${params.toString() ? `?${params.toString()}` : ""}`,
    );

    if (!res.ok) {
      console.error(
        "[worker-status/failure-logs] API returned error:",
        res.status,
      );
      return null;
    }

    const data = (await res.json()) as FailureLogsResponse;
    return data;
  } catch (error) {
    console.error(
      "[worker-status/failure-logs] Failed to fetch failure logs:",
      error,
    );
    return null;
  }
}
