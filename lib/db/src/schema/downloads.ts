import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const downloadsTable = pgTable("downloads", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  platform: text("platform").notNull(),
  mediaType: text("media_type").notNull(),
  title: text("title").notNull(),
  thumbnail: text("thumbnail"),
  author: text("author"),
  format: text("format").notNull(),
  extension: text("extension").notNull(),
  fileSize: text("file_size"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDownloadSchema = createInsertSchema(downloadsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloadsTable.$inferSelect;
