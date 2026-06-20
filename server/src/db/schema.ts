import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
  real,
} from "drizzle-orm/pg-core";

export type Organizations = {
  id: number;
  name: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
};
export type Memberships = {
  id: number;
  userId: number;
  organizationId: number;
  role: "manager" | "employee";
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
export type Locations = {
  id: number;
  userId: number;
  organizationId: number;
  latitude: number;
  longitude: number;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
export type Messages = {
  id: number;
  organizationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const invitationStatuses = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "declined",
]);

export const roleEnum = pgEnum("role", ["manager", "worker"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: uuid("owner_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  organizationId: uuid("organization_id").notNull(),
  role: roleEnum("role").notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  role: roleEnum("role").notNull(),
  status: invitationStatuses("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }).notNull(),
  creatorId: uuid("creator_id").notNull(),
  assignedTo: uuid("assigned_to"),
  status: varchar("status", { length: 50 }).notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  organizationId: uuid("organization_id").notNull(),
  latitude: integer("latitude").notNull(),
  longitude: integer("longitude").notNull(),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull(),
  senderId: uuid("sender_id").notNull(),
  receiverId: uuid("receiver_id").notNull(),
  content: varchar("content", { length: 1000 }).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedWorker: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [tasks.creatorId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [tasks.organizationId],
    references: [organizations.id],
  }),
}));
