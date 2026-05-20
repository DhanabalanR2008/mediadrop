import { Router, type IRouter } from "express";
import { ParseMediaUrlBody, ParseMediaUrlResponse } from "@workspace/api-zod";
import { parseUrl } from "../lib/media-parser";

const router: IRouter = Router();

router.post("/media/parse", async (req, res): Promise<void> => {
  const parsed = ParseMediaUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { url } = parsed.data;

  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL format" });
    return;
  }

  const info = parseUrl(url);
  res.json(ParseMediaUrlResponse.parse(info));
});

export default router;
