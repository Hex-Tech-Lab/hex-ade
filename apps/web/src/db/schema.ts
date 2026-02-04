import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  bigserial,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  path: varchar("path", { length: 1024 }).notNull(),
  hasSpec: boolean("has_spec").default(false),
  defaultConcurrency: integer("default_concurrency").default(3),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by"),
});

export const features = pgTable("features", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).default("FUNCTIONAL"),
  priority: integer("priority").default(0),
  status: varchar("status", { length: 50 }).default("pending"),
  passes: boolean("passes").default(false),
  inProgress: boolean("in_progress").default(false),
  steps: jsonb("steps").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  featureId: bigserial("feature_id", { mode: "bigint" })
    .references(() => features.id, { onDelete: "set null" }),
  taskDescription: text("task_description").notNull(),
  complexity: varchar("complexity", { length: 50 }),
  role: varchar("role", { length: 50 }),
  bias: varchar("bias", { length: 50 }),
  status: varchar("status", { length: 50 }).default("pending"),
  result: jsonb("result"),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  executedAt: timestamp("executed_at", { withTimezone: true }),
});

export const agentLogs = pgTable("agent_logs", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  agentName: varchar("agent_name", { length: 255 }),
  logLevel: varchar("log_level", { length: 20 }),
  message: text("message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
