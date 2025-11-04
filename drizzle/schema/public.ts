import {
  boolean,
  customType,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return "bytea";
  },
});

export const draftResource = pgEnum("draft_resource", ["api", "mcp"]);
export const videoTaskStatus = pgEnum("video_task_status", [
  "INITIALIZED",
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const alembicVersion = pgTable("alembic_version", {
  versionNum: varchar("version_num", { length: 32 }).primaryKey().notNull(),
});

export const videoTasks = pgTable(
  "video_tasks",
  {
    id: serial().primaryKey().notNull(),
    taskId: varchar("task_id", { length: 255 }).notNull(),
    draftId: varchar("draft_id", { length: 255 }).notNull(),
    status: varchar({ length: 64 }).notNull(),
    progress: doublePrecision(),
    message: text(),
    extra: jsonb(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    videoName: varchar("video_name", { length: 255 }),
    renderStatus: videoTaskStatus("render_status")
      .default("INITIALIZED")
      .notNull(),
    videoId: varchar("video_id", { length: 255 }),
  },
  (table) => [
    index("ix_video_tasks_draft_id").using(
      "btree",
      table.draftId.asc().nullsLast().op("text_ops"),
    ),
    index("ix_video_tasks_render_status").using(
      "btree",
      table.renderStatus.asc().nullsLast().op("enum_ops"),
    ),
    index("ix_video_tasks_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("ix_video_tasks_task_id").using(
      "btree",
      table.taskId.asc().nullsLast().op("text_ops"),
    ),
    index("ix_video_tasks_video_id").using(
      "btree",
      table.videoId.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const drafts = pgTable(
  "drafts",
  {
    id: serial().primaryKey().notNull(),
    draftId: varchar("draft_id", { length: 255 }).notNull(),
    data: bytea("data").notNull(),
    width: integer(),
    height: integer(),
    duration: integer(),
    fps: doublePrecision(),
    version: varchar({ length: 64 }),
    sizeBytes: integer("size_bytes"),
    createdAt: timestamp("created_at", {
      mode: "string",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "string",
      withTimezone: true,
    }).notNull(),
    accessedAt: timestamp("accessed_at", {
      mode: "string",
      withTimezone: true,
    }),
    draftName: varchar("draft_name", { length: 255 }),
    resource: draftResource(),
    isDeleted: boolean("is_deleted").notNull(),
    currentVersion: integer("current_version").notNull(),
  },
  (table) => [
    uniqueIndex("ix_drafts_draft_id").using(
      "btree",
      table.draftId.asc().nullsLast().op("text_ops"),
    ),
    index("ix_drafts_is_deleted").using(
      "btree",
      table.isDeleted.asc().nullsLast().op("bool_ops"),
    ),
  ],
);

export const draftVersions = pgTable(
  "draft_versions",
  {
    id: serial().primaryKey().notNull(),
    draftId: varchar("draft_id", { length: 255 }).notNull(),
    version: integer().notNull(),
    data: bytea("data").notNull(),
    width: integer(),
    height: integer(),
    duration: integer(),
    fps: doublePrecision(),
    scriptVersion: varchar("script_version", { length: 64 }),
    sizeBytes: integer("size_bytes"),
    draftName: varchar("draft_name", { length: 255 }),
    resource: draftResource(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("ix_draft_versions_draft_id").using(
      "btree",
      table.draftId.asc().nullsLast().op("text_ops"),
    ),
    unique("uq_draft_versions_draft_id_version").on(
      table.draftId,
      table.version,
    ),
  ],
);

export const videos = pgTable(
  "videos",
  {
    id: serial().primaryKey().notNull(),
    videoId: varchar("video_id", { length: 255 }).notNull(),
    draftId: varchar("draft_id", { length: 255 }).notNull(),
    videoName: varchar("video_name", { length: 255 }),
    resolution: varchar({ length: 64 }),
    framerate: varchar({ length: 32 }),
    duration: doublePrecision(),
    fileSize: integer("file_size"),
    ossUrl: text("oss_url"),
    thumbnailUrl: text("thumbnail_url"),
    extra: jsonb(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("ix_videos_draft_id").using(
      "btree",
      table.draftId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("ix_videos_video_id").using(
      "btree",
      table.videoId.asc().nullsLast().op("text_ops"),
    ),
  ],
);
