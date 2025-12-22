import type { Metadata } from "next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { fetchWorkerStatus } from "./actions";

export const metadata: Metadata = {
  title: "Worker Status",
};

export default async function WorkerStatusPage() {
  const data = await fetchWorkerStatus();
  const workers = data?.workers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Render Worker Status</h1>
        <p className="text-muted-foreground">
          Monitor Celery worker availability and recent failures.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          Total workers:{" "}
          <strong className="text-foreground">
            {data?.total_workers ?? "-"}
          </strong>
        </span>
        <span>
          Available:{" "}
          <strong className="text-foreground">
            {data?.available_workers ?? "-"}
          </strong>
        </span>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Heartbeat</TableHead>
              <TableHead>Last Failure</TableHead>
              <TableHead>Failure Reason</TableHead>
              <TableHead>Failure Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No worker status reported yet.
                </TableCell>
              </TableRow>
            )}
            {workers.map((worker) => {
              const lastHeartbeat = worker.last_heartbeat
                ? new Date(worker.last_heartbeat * 1000).toLocaleString()
                : "-";
              const lastFailure = worker.last_failure_at
                ? new Date(worker.last_failure_at * 1000).toLocaleString()
                : "-";

              return (
                <TableRow key={worker.worker_name}>
                  <TableCell className="font-mono">
                    {worker.worker_name}
                  </TableCell>
                  <TableCell>{worker.hostname ?? "-"}</TableCell>
                  <TableCell>
                    <span
                      className={
                        worker.is_available
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {worker.is_available ? "Available" : "Unavailable"}
                    </span>
                  </TableCell>
                  <TableCell>{lastHeartbeat}</TableCell>
                  <TableCell>{lastFailure}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {worker.last_failure_reason ?? "-"}
                  </TableCell>
                  <TableCell>{worker.failure_count ?? 0}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
