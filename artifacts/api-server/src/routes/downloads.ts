import { Router, type IRouter } from "express";
import { eq, desc, count, and, sql } from "drizzle-orm";
import { db, downloadsTable } from "@workspace/db";
import {
  CreateDownloadBody,
  GetDownloadParams,
  DeleteDownloadParams,
  ListDownloadsQueryParams,
  ListDownloadsResponse,
  GetDownloadResponse,
  GetRecentDownloadsQueryParams,
  GetRecentDownloadsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/downloads", async (req, res): Promise<void> => {
  const queryParsed = ListDownloadsQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }

  const { limit = 20, offset = 0, platform, mediaType } = queryParsed.data;

  const conditions = [];
  if (platform) conditions.push(eq(downloadsTable.platform, platform));
  if (mediaType) conditions.push(eq(downloadsTable.mediaType, mediaType));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [downloads, totalResult] = await Promise.all([
    db
      .select()
      .from(downloadsTable)
      .where(whereClause)
      .orderBy(desc(downloadsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(downloadsTable).where(whereClause),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);

  res.json(
    ListDownloadsResponse.parse({
      downloads: downloads.map((d) => ({ ...d, mediaType: d.mediaType, fileSize: d.fileSize })),
      total,
    })
  );
});

router.post("/downloads", async (req, res): Promise<void> => {
  const parsed = CreateDownloadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { url, platform, mediaType, title, thumbnail, author, format, extension, fileSize } = parsed.data;

  const [download] = await db
    .insert(downloadsTable)
    .values({ url, platform, mediaType, title, thumbnail, author, format, extension, fileSize })
    .returning();

  res.status(201).json(GetDownloadResponse.parse({ ...download, mediaType: download.mediaType }));
});

router.get("/downloads/:id", async (req, res): Promise<void> => {
  const params = GetDownloadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [download] = await db
    .select()
    .from(downloadsTable)
    .where(eq(downloadsTable.id, params.data.id));

  if (!download) {
    res.status(404).json({ error: "Download not found" });
    return;
  }

  res.json(GetDownloadResponse.parse({ ...download, mediaType: download.mediaType }));
});

router.delete("/downloads/:id", async (req, res): Promise<void> => {
  const params = DeleteDownloadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(downloadsTable)
    .where(eq(downloadsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Download not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
