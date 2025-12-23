"use client";

import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePageTitle } from "@/hooks/use-page-title";

import { deleteWorker, fetchFailureLogs, fetchWorkerStatus } from "./actions";

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

export default function WorkerStatusPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<WorkerStatusResponse | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [failureLogs, setFailureLogs] = useState<FailureLogsResponse | null>(
    null,
  );
  const [failureLogsOpen, setFailureLogsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Set page title
  usePageTitle("page_titles.worker_status");

  const workers = data?.workers ?? [];

  const fetchData = async () => {
    setLoading(true);
    const result = await fetchWorkerStatus();
    setData(result);
    setLoading(false);
  };

  const handleDeleteWorker = async () => {
    if (!workerToDelete) return;

    setLoading(true);
    const result = await deleteWorker(workerToDelete);
    setLoading(false);

    if (result.success) {
      setDeleteDialogOpen(false);
      setWorkerToDelete(null);
      await fetchData();
    } else {
      alert(t("worker_status.delete.error") + ": " + result.message);
    }
  };

  const handleViewFailureLogs = async (workerName: string) => {
    setLoading(true);
    setSelectedWorker(workerName);
    const result = await fetchFailureLogs(workerName, 50);
    setFailureLogs(result);
    setLoading(false);
    setFailureLogsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("worker_status.title")}</h1>
        <p className="text-muted-foreground">{t("worker_status.subtitle")}</p>
      </div>

      <Button onClick={fetchData} disabled={loading} variant="outline">
        {loading ? t("worker_status.loading") : t("worker_status.refresh")}
      </Button>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          {t("worker_status.total_workers")}:{" "}
          <strong className="text-foreground">
            {data?.total_workers ?? "-"}
          </strong>
        </span>
        <span>
          {t("worker_status.available")}:{" "}
          <strong className="text-foreground">
            {data?.available_workers ?? "-"}
          </strong>
        </span>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("worker_status.table.worker")}</TableHead>
              <TableHead>{t("worker_status.table.hostname")}</TableHead>
              <TableHead>{t("worker_status.table.status")}</TableHead>
              <TableHead>{t("worker_status.table.last_heartbeat")}</TableHead>
              <TableHead>{t("worker_status.table.last_failure")}</TableHead>
              <TableHead>{t("worker_status.table.failure_reason")}</TableHead>
              <TableHead>{t("worker_status.table.failure_count")}</TableHead>
              <TableHead className="text-right">
                {t("worker_status.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {t("worker_status.no_workers")}
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
                      {worker.is_available
                        ? t("worker_status.status.available")
                        : t("worker_status.status.unavailable")}
                    </span>
                  </TableCell>
                  <TableCell>{lastHeartbeat}</TableCell>
                  <TableCell>{lastFailure}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {worker.last_failure_reason ?? "-"}
                  </TableCell>
                  <TableCell>{worker.failure_count ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleViewFailureLogs(worker.worker_name)
                        }
                        disabled={loading}
                      >
                        <AlertTriangleIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setWorkerToDelete(worker.worker_name);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Worker Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("worker_status.delete.title")}</DialogTitle>
            <DialogDescription>
              {t("worker_status.delete.confirm", {
                workerName: workerToDelete,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setWorkerToDelete(null);
              }}
              disabled={loading}
            >
              {t("worker_status.delete.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWorker}
              disabled={loading}
            >
              {loading
                ? t("worker_status.delete.deleting")
                : t("worker_status.delete.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Failure Logs Dialog */}
      <Dialog open={failureLogsOpen} onOpenChange={setFailureLogsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("worker_status.failure_logs.title")}</DialogTitle>
            <DialogDescription>
              {t("worker_status.failure_logs.description", {
                workerName: selectedWorker,
              })}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <div className="p-4">
              {loading ? (
                <p className="text-center text-muted-foreground">
                  {t("worker_status.loading")}
                </p>
              ) : !failureLogs || failureLogs.logs.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {t("worker_status.failure_logs.no_logs")}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {t("worker_status.failure_logs.total_logs", {
                      count: failureLogs.total_logs,
                    })}
                  </div>
                  {failureLogs.logs.map((log) => (
                    <Alert key={log.id} variant="destructive">
                      <AlertTriangleIcon className="h-4 w-4" />
                      <div className="ml-2">
                        <div className="font-medium">
                          {t("worker_status.failure_logs.task_id")}:{" "}
                          {log.task_id ?? "N/A"}
                        </div>
                        <div className="text-sm">
                          {new Date(log.created_at * 1000).toLocaleString()}
                        </div>
                        <div className="text-sm mt-1">{log.failure_reason}</div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setFailureLogsOpen(false)}>
              {t("worker_status.failure_logs.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
