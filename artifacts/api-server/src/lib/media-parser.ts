import { execSync } from "node:child_process";

export type Platform =
  | "youtube"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "twitter"
  | "pinterest"
  | "vimeo"
  | "reddit"
  | "soundcloud"
  | "threads"
  | "linkedin"
  | "direct";

export type MediaType = "video" | "audio" | "image" | "carousel";

export interface MediaFormat {
  id: string;
  label: string;
  type: "video" | "audio" | "image";
  extension: string;
  quality: string | null;
  size: string | null;
  url: string | null;
}

export interface MediaInfo {
  url: string;
  platform: string;
  mediaType: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  duration: number | null;
  author: string | null;
  formats: MediaFormat[];
}

export function detectPlatform(url: string): Platform {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host.includes("youtube.com") || host === "youtu.be") return "youtube";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("facebook.com") || host === "fb.com" || host === "fb.watch") return "facebook";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("twitter.com") || host === "x.com") return "twitter";
    if (host.includes("pinterest.com") || host === "pin.it") return "pinterest";
    if (host.includes("vimeo.com")) return "vimeo";
    if (host.includes("reddit.com") || host === "redd.it") return "reddit";
    if (host.includes("soundcloud.com")) return "soundcloud";
    if (host.includes("threads.net")) return "threads";
    if (host.includes("linkedin.com")) return "linkedin";
    return "direct";
  } catch {
    return "direct";
  }
}

function buildDownloadUrl(sourceUrl: string, quality: string, ext: string): string {
  return `/api/download/ytdlp?sourceUrl=${encodeURIComponent(sourceUrl)}&quality=${encodeURIComponent(quality)}&ext=${encodeURIComponent(ext)}`;
}

function videoFormats(sourceUrl: string): MediaFormat[] {
  return [
    { id: "v-2160", label: "4K Ultra HD",   type: "video", extension: "mp4", quality: "2160p", size: null, url: buildDownloadUrl(sourceUrl, "2160", "mp4") },
    { id: "v-1080", label: "1080p Full HD", type: "video", extension: "mp4", quality: "1080p", size: null, url: buildDownloadUrl(sourceUrl, "1080", "mp4") },
    { id: "v-720",  label: "720p HD",       type: "video", extension: "mp4", quality: "720p",  size: null, url: buildDownloadUrl(sourceUrl, "720",  "mp4") },
    { id: "v-480",  label: "480p SD",       type: "video", extension: "mp4", quality: "480p",  size: null, url: buildDownloadUrl(sourceUrl, "480",  "mp4") },
    { id: "v-360",  label: "360p",          type: "video", extension: "mp4", quality: "360p",  size: null, url: buildDownloadUrl(sourceUrl, "360",  "mp4") },
  ];
}

function audioFormats(sourceUrl: string): MediaFormat[] {
  return [
    { id: "a-320", label: "MP3 320kbps", type: "audio", extension: "mp3", quality: "320kbps", size: null, url: buildDownloadUrl(sourceUrl, "mp3-320", "mp3") },
    { id: "a-192", label: "MP3 192kbps", type: "audio", extension: "mp3", quality: "192kbps", size: null, url: buildDownloadUrl(sourceUrl, "mp3-192", "mp3") },
    { id: "a-128", label: "MP3 128kbps", type: "audio", extension: "mp3", quality: "128kbps", size: null, url: buildDownloadUrl(sourceUrl, "mp3-128", "mp3") },
  ];
}

function imageFormats(thumbnail: string | null): MediaFormat[] {
  const imgUrl = thumbnail ?? "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1280&h=720&fit=crop";
  return [
    { id: "img-orig", label: "Original Quality", type: "image", extension: "jpg",  quality: "original", size: null, url: imgUrl },
    { id: "img-webp", label: "WebP Format",      type: "image", extension: "webp", quality: "original", size: null, url: imgUrl },
  ];
}

const AUDIO_ONLY_PLATFORMS = new Set(["soundcloud"]);
const IMAGE_PLATFORMS = new Set(["pinterest"]);

function getFormats(platform: Platform, sourceUrl: string, thumbnail: string | null): MediaFormat[] {
  if (AUDIO_ONLY_PLATFORMS.has(platform)) {
    return audioFormats(sourceUrl);
  }
  if (IMAGE_PLATFORMS.has(platform)) {
    return imageFormats(thumbnail);
  }
  const video = videoFormats(sourceUrl);
  const audio = audioFormats(sourceUrl);
  if (platform === "instagram" || platform === "twitter" || platform === "reddit" || platform === "threads") {
    return [...video, ...audio, ...imageFormats(thumbnail)];
  }
  return [...video, ...audio];
}

function tryYtDlp(url: string): Record<string, unknown> | null {
  try {
    const raw = execSync(
      `yt-dlp --dump-json --no-playlist --no-warnings --socket-timeout 15 --extractor-args "youtube:player_client=android,web" "${url}"`,
      { timeout: 25000, encoding: "utf-8" }
    );
    return JSON.parse(raw.trim().split("\n")[0]);
  } catch {
    return null;
  }
}

const FALLBACK_TITLES: Record<Platform, string[]> = {
  youtube:   ["How to Build a Full-Stack App", "Top JavaScript Tips", "The Ultimate Guide"],
  instagram: ["Morning Routine", "Golden Hour Vibes", "Travel Highlights"],
  facebook:  ["Family Reunion", "Cooking Tutorial", "Behind the Scenes"],
  tiktok:    ["POV: You Fixed the Bug", "Life Hack", "Day in the Life"],
  twitter:   ["Thread: TypeScript Tips", "Important Update", "New Feature Demo"],
  pinterest: ["Minimalist Decor", "Color Palette", "Typography Board"],
  vimeo:     ["Short Film", "Product Launch Cinematic", "Portfolio Reel"],
  reddit:    ["Amazing Project Showcase", "Interesting Fact", "Incredible Moment"],
  soundcloud:["Lo-Fi Study Mix", "Deep House Session", "Acoustic Cover"],
  threads:   ["Thoughts on AI", "Design Inspiration", "Just shipped something"],
  linkedin:  ["Career Lessons", "Leadership Advice", "Startup Story"],
  direct:    ["Media File", "Downloaded Content", "Media Download"],
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function parseUrl(url: string): MediaInfo {
  const platform = detectPlatform(url);

  // Try real metadata via yt-dlp
  const info = tryYtDlp(url);

  const title = (info?.title as string) || randomItem(FALLBACK_TITLES[platform]);
  const thumbnail = (info?.thumbnail as string) || null;
  const duration = (info?.duration as number) || null;
  const author = (info?.uploader as string) || (info?.channel as string) || null;
  const description = (info?.description as string) || null;

  const isAudioOnly = AUDIO_ONLY_PLATFORMS.has(platform);
  const isImageOnly = IMAGE_PLATFORMS.has(platform);
  const mediaType = isAudioOnly ? "audio" : isImageOnly ? "image" : "video";

  return {
    url,
    platform,
    mediaType,
    title,
    description,
    thumbnail,
    duration,
    author,
    formats: getFormats(platform, url, thumbnail),
  };
}
