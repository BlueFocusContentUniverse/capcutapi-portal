import { and, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";

import { db } from "./db";
import { drafts, videos, videoTasks } from "./schema/public";

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
  currentVersion: number | null;
};

export async function getDraftsPaginated(
  page: number,
  pageSize: number,
  search?: string,
  startDate?: string,
  endDate?: string,
) {
  const safePageSize = Math.max(1, Math.min(100, Math.floor(pageSize || 10)));
  const safePage = Math.max(1, Math.floor(page || 1));
  const offset = (safePage - 1) * safePageSize;

  // Build search conditions
  const conditions = [];

  // Always exclude deleted drafts
  conditions.push(eq(drafts.isDeleted, false));

  if (search) {
    // Search in draftId, draftName
    conditions.push(
      or(
        ilike(drafts.draftId, `%${search}%`),
        ilike(drafts.draftName, `%${search}%`),
      ),
    );
  }

  if (startDate) {
    conditions.push(gte(drafts.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(drafts.createdAt, endDate));
  }

  const whereClause = and(...conditions);

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
        currentVersion: drafts.currentVersion,
      })
      .from(drafts)
      .where(whereClause)
      .orderBy(desc(drafts.createdAt))
      .limit(safePageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(drafts)
      .where(whereClause)
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
  renderStatus: string;
  videoName: string | null;
  status: string;
  progress: number | null;
  message: string | null;
  extra: unknown | null;
  createdAt: string;
  updatedAt: string;
  videoId: string | null;
  ossUrl: string | null;
};

export async function getVideoTasksPaginated(
  page: number,
  pageSize: number,
  search?: string,
  startDate?: string,
  endDate?: string,
) {
  const safePageSize = Math.max(1, Math.min(100, Math.floor(pageSize || 10)));
  const safePage = Math.max(1, Math.floor(page || 1));
  const offset = (safePage - 1) * safePageSize;

  // Build search conditions
  const conditions = [];

  if (search) {
    // Search in draftId, videoName
    conditions.push(
      or(
        ilike(videoTasks.draftId, `%${search}%`),
        ilike(videoTasks.videoName, `%${search}%`),
      ),
    );
  }

  if (startDate) {
    conditions.push(gte(videoTasks.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(videoTasks.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, totalRow] = await Promise.all([
    db
      .select({
        id: videoTasks.id,
        taskId: videoTasks.taskId,
        draftId: videoTasks.draftId,
        videoName: videoTasks.videoName,
        status: videoTasks.status,
        progress: videoTasks.progress,
        renderStatus: videoTasks.renderStatus,
        message: videoTasks.message,
        extra: videoTasks.extra,
        createdAt: videoTasks.createdAt,
        updatedAt: videoTasks.updatedAt,
        videoId: videoTasks.videoId,
        ossUrl: videos.ossUrl,
      })
      .from(videoTasks)
      .leftJoin(videos, eq(videoTasks.videoId, videos.videoId))
      .where(whereClause)
      .orderBy(desc(videoTasks.createdAt))
      .limit(safePageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(videoTasks)
      .where(whereClause)
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

// Dashboard count queries
export async function getDraftCounts() {
  const [totalDrafts, weeklyDrafts] = await Promise.all([
    db
      .select({ value: count() })
      .from(drafts)
      .then((rows) => Number(rows[0]?.value ?? 0)),
    getWeeklyDrafts(),
  ]);

  return {
    total: totalDrafts,
    weekly: weeklyDrafts,
  };
}

export async function getVideoTaskCounts() {
  const [totalTasks, weeklyTasks] = await Promise.all([
    db
      .select({ value: count() })
      .from(videoTasks)
      .then((rows) => Number(rows[0]?.value ?? 0)),
    getWeeklyVideoTasks(),
  ]);

  return {
    total: totalTasks,
    weekly: weeklyTasks,
  };
}

// Helper function to get weekly data for the last 7 days
async function getWeeklyDrafts() {
  const today = new Date();
  const weeklyData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const draftCount = await db
      .select({ value: count() })
      .from(drafts)
      .where(
        and(
          gte(drafts.createdAt, dayStart.toISOString()),
          lte(drafts.createdAt, dayEnd.toISOString()),
        ),
      )
      .then((rows) => Number(rows[0]?.value ?? 0));

    weeklyData.push({
      date: date.toISOString().split("T")[0], // YYYY-MM-DD format
      count: draftCount,
      day: date.toLocaleDateString("zh-Hans", { weekday: "short" }),
    });
  }

  return weeklyData;
}

async function getWeeklyVideoTasks() {
  const today = new Date();
  const weeklyData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const videoTaskCount = await db
      .select({ value: count() })
      .from(videoTasks)
      .where(
        and(
          gte(videoTasks.createdAt, dayStart.toISOString()),
          lte(videoTasks.createdAt, dayEnd.toISOString()),
        ),
      )
      .then((rows) => Number(rows[0]?.value ?? 0));

    weeklyData.push({
      date: date.toISOString().split("T")[0], // YYYY-MM-DD format
      count: videoTaskCount,
      day: date.toLocaleDateString("zh-Hans", { weekday: "short" }),
    });
  }

  return weeklyData;
}
