import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};
export type Organizations = {
  id: number;
  name: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}
export type Memberships = {
  id: number;
  userId: number;
  organizationId: number;
  role: "manager" | "employee";
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
export type Invitations = {
  id: number;
  organizationId: number;
  email: string;
  token: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
}
export type Tasks = {
  id: number;
  organizationId: number;
  title: string;
  description: string;
  creatorId: number;
  assignedTo: number | null;
  status: "pending" | "in_progress" | "completed";
  latitude: number | null;
  longitude: number | null;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
export type Locations = {
  id: number;
  userId: number;
  organizationId: number;
  latitude: number;
  longitude: number;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
export type Messages = {
  id: number;
  organizationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const UsersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: integer("created_at").notNull().default(0),
  updatedAt: integer("updated_at").notNull().default(0),
});

export const OrganizationsTable = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: uuid("owner_id").notNull(),
  createdAt: integer("created_at").notNull().default(0),
  updatedAt: integer("updated_at").notNull().default(0),
});

export const MembershipsTable = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  organizationId: uuid("organization_id").notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  joinedAt: integer("joined_at").notNull().default(0),
  createdAt: integer("created_at").notNull().default(0),
  updatedAt: integer("updated_at").notNull().default(0),
});

export const InvitationsTable = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull(),  
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: integer("created_at").notNull().default(0),
  updatedAt: integer("updated_at").notNull().default(0),
});

export const TasksTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull(),  
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }).notNull(),
  creatorId: uuid("creator_id").notNull(),
  assignedTo: uuid("assigned_to"),
  status: varchar("status", { length: 50 }).notNull(),
  latitude: integer("latitude"),
  longitude: integer("longitude"),
  deadline: integer("deadline"),
  createdAt: integer("created_at").notNull().default(0),
  updatedAt: integer("updated_at").notNull().default(0),
});

export const LocationsTable = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),  
  organizationId: uuid("organization_id").notNull(),
  latitude: integer("latitude").notNull(),
  longitude: integer("longitude").notNull(),
  recordedAt: integer("recorded_at").notNull(),
  createdAt: integer("created_at").notNull().default(0),
  updatedAt: integer("updated_at").notNull().default(0),
});

export const MessagesTable = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull(),
  senderId: uuid("sender_id").notNull(),
  receiverId: uuid("receiver_id").notNull(),
  content: varchar("content", { length: 1000 }).notNull(),
  readAt: integer("read_at"),
  createdAt: integer("created_at").notNull().default(0),
  updatedAt: integer("updated_at").notNull().default(0),
}); 

