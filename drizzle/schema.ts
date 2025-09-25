import type { AdapterAccountType } from "@auth/core/adapters";
import {
  boolean,
  customType,
  doublePrecision,
  foreignKey,
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

export const alembicVersion = pgTable("alembic_version", {
  versionNum: varchar("version_num", { length: 32 }).primaryKey().notNull(),
});

export const videoTasks = pgTable(
  "video_tasks",
  {
    id: serial().primaryKey().notNull(),
    taskId: varchar("task_id", { length: 255 }).notNull(),
    draftId: varchar("draft_id", { length: 255 }).notNull(),
    videoName: varchar("video_name", { length: 255 }),
    status: varchar({ length: 64 }).notNull(),
    progress: integer(),
    message: text(),
    draftUrl: text("draft_url"),
    extra: jsonb(),
    createdAt: timestamp("created_at", {
      mode: "string",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "string",
      withTimezone: true,
    }).notNull(),
  },
  (table) => [
    index("ix_video_tasks_draft_id").using(
      "btree",
      table.draftId.asc().nullsLast().op("text_ops"),
    ),
    index("ix_video_tasks_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("ix_video_tasks_task_id").using(
      "btree",
      table.taskId.asc().nullsLast().op("text_ops"),
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
  },
  (table) => [
    uniqueIndex("ix_drafts_draft_id").using(
      "btree",
      table.draftId.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const authenticator = pgTable(
  "authenticator",
  {
    credentialId: text().notNull(),
    userId: text().notNull(),
    providerAccountId: text().notNull(),
    credentialPublicKey: text().notNull(),
    counter: integer().notNull(),
    credentialDeviceType: text().notNull(),
    credentialBackedUp: boolean().notNull(),
    transports: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "authenticator_userId_user_id_fk",
    }).onDelete("cascade"),
    unique("authenticator_credentialID_unique").on(table.credentialId),
  ],
);

export const session = pgTable(
  "session",
  {
    sessionToken: text().primaryKey().notNull(),
    userId: text().notNull(),
    expires: timestamp({ mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_userId_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const user = pgTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [unique("user_email_unique").on(table.email)],
);

export const verificationToken = pgTable("verificationToken", {
  identifier: text().notNull(),
  token: text().notNull(),
  expires: timestamp({ mode: "string" }).notNull(),
});

export const account = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_userId_user_id_fk",
    }).onDelete("cascade"),
  ],
);
