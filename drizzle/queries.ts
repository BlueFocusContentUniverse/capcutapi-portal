import { count, desc } from "drizzle-orm";

import { db } from "./db";
import { drafts, videoTasks } from "./schema/public";

export type DraftListItem = {
  id: number;
  draftId: string;
  draftName: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  fps: number | null;
  version: string | null;
  sizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
  accessedAt: string | null;
  resource: string | null;
};

export async function getDraftsPaginated(page: number, pageSize: number) {
  const safePageSize = Math.max(1, Math.min(100, Math.floor(pageSize || 10)));
  const safePage = Math.max(1, Math.floor(page || 1));
  const offset = (safePage - 1) * safePageSize;

  const [items, totalRow] = await Promise.all([
    db
      .select({
        id: drafts.id,
        draftId: drafts.draftId,
        draftName: drafts.draftName,
        width: drafts.width,
        height: drafts.height,
        duration: drafts.duration,
        fps: drafts.fps,
        version: drafts.version,
        sizeBytes: drafts.sizeBytes,
        createdAt: drafts.createdAt,
        updatedAt: drafts.updatedAt,
        accessedAt: drafts.accessedAt,
        resource: drafts.resource,
      })
      .from(drafts)
      .orderBy(desc(drafts.createdAt))
      .limit(safePageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(drafts)
      .then((rows) => rows[0]),
  ]);

  const total = Number(totalRow?.value ?? 0);
  return {
    items: items as DraftListItem[],
    total,
    page: safePage,
    pageSize: safePageSize,
  };
}

export type VideoTaskListItem = {
  id: number;
  taskId: string;
  draftId: string;
  videoName: string | null;
  status: string;
  progress: number | null;
  message: string | null;
  draftUrl: string | null;
  extra: unknown | null;
  createdAt: string;
  updatedAt: string;
};

export async function getVideoTasksPaginated(page: number, pageSize: number) {
  const safePageSize = Math.max(1, Math.min(100, Math.floor(pageSize || 10)));
  const safePage = Math.max(1, Math.floor(page || 1));
  const offset = (safePage - 1) * safePageSize;

  const [items, totalRow] = await Promise.all([
    db
      .select({
        id: videoTasks.id,
        taskId: videoTasks.taskId,
        draftId: videoTasks.draftId,
        videoName: videoTasks.videoName,
        status: videoTasks.status,
        progress: videoTasks.progress,
        message: videoTasks.message,
        draftUrl: videoTasks.draftUrl,
        extra: videoTasks.extra,
        createdAt: videoTasks.createdAt,
        updatedAt: videoTasks.updatedAt,
      })
      .from(videoTasks)
      .orderBy(desc(videoTasks.createdAt))
      .limit(safePageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(videoTasks)
      .then((rows) => rows[0]),
  ]);

  const total = Number(totalRow?.value ?? 0);
  return {
    items: items as VideoTaskListItem[],
    total,
    page: safePage,
    pageSize: safePageSize,
  };
}
