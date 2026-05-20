import { Router, type IRouter } from "express";
import { desc, count, sql } from "drizzle-orm";
import { db, downloadsTable } from "@workspace/db";
import {
  GetRecentDownloadsQueryParams,
  GetRecentDownloadsResponse,
  GetStatsSummaryResponse,
  GetPlatformBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [totals, platformsResult, todayResult] = await Promise.all([
    db
      .select({
        total: count(),
        videos: sql<number>`count(*) filter (where ${downloadsTable.mediaType} = 'video')`.mapWith(Number),
        audios: sql<number>`count(*) filter (where ${downloadsTable.mediaType} = 'audio')`.mapWith(Number),
        images: sql<number>`count(*) filter (where ${downloadsTable.mediaType} = 'image')`.mapWith(Number),
      })
      .from(downloadsTable),
    db
      .select({ platform: downloadsTable.platform, cnt: count() })
      .from(downloadsTable)
      .groupBy(downloadsTable.platform)
      .orderBy(desc(count()))
      .limit(1),
    db
      .select({ cnt: count() })
      .from(downloadsTable)
      .where(sql`${downloadsTable.createdAt} >= now() - interval '1 day'`),
  ]);

  const row = totals[0];
  const topPlatform = platformsResult[0]?.platform ?? "youtube";
  const downloadsToday = Number(todayResult[0]?.cnt ?? 0);

  res.json(
    GetStatsSummaryResponse.parse({
      totalDownloads: Number(row?.total ?? 0),
      totalVideos: Number(row?.videos ?? 0),
      totalAudios: Number(row?.audios ?? 0),
      totalImages: Number(row?.images ?? 0),
      topPlatform,
      downloadsToday,
    })
  );
});

router.get("/stats/recent", async (req, res): Promise<void> => {
  const queryParsed = GetRecentDownloadsQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }

  const limit = queryParsed.data.limit ?? 10;

  const downloads = await db
    .select()
    .from(downloadsTable)
    .orderBy(desc(downloadsTable.createdAt))
    .limit(limit);

  res.json(GetRecentDownloadsResponse.parse(downloads));
});

router.get("/stats/platforms", async (_req, res): Promise<void> => {
  const platforms = await db
    .select({ platform: downloadsTable.platform, count: count() })
    .from(downloadsTable)
    .groupBy(downloadsTable.platform)
    .orderBy(desc(count()));

  res.json(GetPlatformBreakdownResponse.parse(platforms));
});

export default router;
