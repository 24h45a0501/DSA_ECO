import { pgTable, text, integer, timestamp, boolean, jsonb, serial, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).default("Anonymous"),
  email: varchar("email", { length: 255 }).unique(),
  xp: integer("xp").default(0),
  coins: integer("coins").default(0),
  streak: integer("streak").default(0),
  lastActive: timestamp("last_active").defaultNow(),
  completedTopics: jsonb("completed_topics").default([]),
  achievements: jsonb("achievements").default([]),
  skillLevel: varchar("skill_level", { length: 50 }).default("beginner"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  structureType: varchar("structure_type", { length: 100 }),
  operation: varchar("operation", { length: 100 }),
  completed: boolean("completed").default(false),
  score: integer("score").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: varchar("type", { length: 100 }),
  structureType: varchar("structure_type", { length: 100 }),
  question: text("question"),
  answer: text("answer"),
  correct: boolean("correct").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  role: varchar("role", { length: 50 }),
  content: text("content"),
  context: varchar("context", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow(),
});
