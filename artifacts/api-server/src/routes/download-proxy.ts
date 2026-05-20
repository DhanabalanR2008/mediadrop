import { Router, type IRouter } from "express";
import https from "node:https";
import http from "node:http";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, readdirSync, createReadStream, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const router: IRouter = Router();

const YT_CLIENT_ARGS = ["--extractor-args", "youtube:player_client=android,web"];

// Real yt-dlp download endpoint — downloads to temp file then streams
router.get("/download/ytdlp", async (req, res): Promise<void> => {
  const { sourceUrl, quality, ext, filename } = req.query;

  if (!sourceUrl || typeof sourceUrl !== "string") {
    res.status(400).json({ error: "Missing sourceUrl" });
    return;
  }

  const q = typeof quality === "string" ? quality : "1080";
  const e = typeof ext === "string" ? ext : "mp4";
  const isAudio = e === "mp3" || q.startsWith("mp3");

  const safeFilename = typeof filename === "string" && filename
    ? filename.replace(/[^a-z0-9._\-]/gi, "_")
    : `download.${isAudio ? "mp3" : "mp4"}`;

  req.log.info({ sourceUrl, quality: q, ext: e }, "Starting yt-dlp download");

  // Create temp directory for this download
  const tmpDir = mkdtempSync(join(tmpdir(), "mediadrop-"));
  const outputTemplate = join(tmpDir, "%(title)s.%(ext)s");

  let args: string[];

  if (isAudio) {
    const kbps = q.replace("mp3-", "").replace("kbps", "");
    const audioQuality = kbps === "320" ? "0" : kbps === "192" ? "2" : "5";
    args = [
      "--no-playlist",
      "--no-warnings",
      ...YT_CLIENT_ARGS,
      "-f", "bestaudio/best",
      "-x", "--audio-format", "mp3",
      "--audio-quality", audioQuality,
      "-o", outputTemplate,
      sourceUrl,
    ];
  } else {
    const height = parseInt(q, 10) || 1080;
    args = [
      "--no-playlist",
      "--no-warnings",
      ...YT_CLIENT_ARGS,
      "-f", `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}][ext=mp4]/best[ext=mp4]/best`,
      "--merge-output-format", "mp4",
      "-o", outputTemplate,
      sourceUrl,
    ];
  }

  const cleanup = () => {
    try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  };

  const ytdlp = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });

  let stderrBuf = "";
  ytdlp.stderr.on("data", (d: Buffer) => {
    stderrBuf += d.toString();
    req.log.debug({ line: d.toString().trim() }, "yt-dlp");
  });

  ytdlp.on("close", (code) => {
    req.log.info({ code }, "yt-dlp finished");

    if (code !== 0) {
      req.log.error({ stderr: stderrBuf }, "yt-dlp failed");
      cleanup();
      if (!res.headersSent) res.status(500).json({ error: "Download failed. The video may be private or unavailable." });
      return;
    }

    // Find the output file
    let files: string[] = [];
    try {
      files = readdirSync(tmpDir).map((f) => join(tmpDir, f));
    } catch {
      cleanup();
      if (!res.headersSent) res.status(500).json({ error: "Output file not found" });
      return;
    }

    if (files.length === 0) {
      cleanup();
      if (!res.headersSent) res.status(500).json({ error: "No file downloaded" });
      return;
    }

    const outFile = files[0];
    const ext = outFile.split(".").pop() ?? "mp4";
    const contentType = isAudio ? "audio/mpeg" : "video/mp4";
    let fileSize: number;
    try {
      fileSize = statSync(outFile).size;
    } catch {
      cleanup();
      if (!res.headersSent) res.status(500).json({ error: "Could not stat output file" });
      return;
    }

    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", fileSize);
    res.setHeader("Cache-Control", "no-store");

    const stream = createReadStream(outFile);
    stream.pipe(res);
    stream.on("end", cleanup);
    stream.on("error", (err) => {
      req.log.error({ err }, "Stream error");
      cleanup();
    });
  });

  ytdlp.on("error", (err) => {
    req.log.error({ err }, "yt-dlp spawn error");
    cleanup();
    if (!res.headersSent) res.status(500).json({ error: "Download failed" });
  });

  req.on("close", () => {
    ytdlp.kill("SIGTERM");
    cleanup();
  });
});

// Generic HTTP proxy for direct image/file URLs
router.get("/download/proxy", (req, res): void => {
  const { url, filename } = req.query;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing url parameter" });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  const safeFilename = typeof filename === "string" && filename
    ? filename.replace(/[^a-z0-9._\-]/gi, "_")
    : "download";

  const protocol = parsedUrl.protocol === "https:" ? https : http;

  protocol.get(url, (upstream) => {
    const statusCode = upstream.statusCode ?? 500;

    if (statusCode >= 400) {
      res.status(502).json({ error: "Failed to fetch file from source" });
      upstream.resume();
      return;
    }

    if (statusCode >= 300 && statusCode < 400 && upstream.headers.location) {
      res.redirect(`/api/download/proxy?url=${encodeURIComponent(upstream.headers.location)}&filename=${encodeURIComponent(safeFilename)}`);
      upstream.resume();
      return;
    }

    const contentType = upstream.headers["content-type"] ?? "application/octet-stream";
    const contentLength = upstream.headers["content-length"];

    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.setHeader("Cache-Control", "no-store");

    upstream.pipe(res);
    upstream.on("error", (err) => {
      req.log.error({ err }, "Upstream stream error");
      if (!res.headersSent) res.status(500).json({ error: "Stream error" });
    });
  }).on("error", (err) => {
    req.log.error({ err }, "Failed to connect to upstream");
    if (!res.headersSent) res.status(502).json({ error: "Failed to connect to source" });
  });
});

export default router;
