import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Image as ImageIcon, Music, Video, Download as DownloadIcon, Clock, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  useParseMediaUrl, 
  useCreateDownload, 
  useGetRecentDownloads,
  getGetRecentDownloadsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Downloader() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialUrl = searchParams.get("url") || "";
  
  const [url, setUrl] = useState(initialUrl);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseMutation = useParseMediaUrl();
  const downloadMutation = useCreateDownload();
  const { data: recentDownloads } = useGetRecentDownloads({ limit: 5 });

  useEffect(() => {
    if (initialUrl && !parseMutation.data && !parseMutation.isPending) {
      parseMutation.mutate({ data: { url: initialUrl } });
    }
  }, [initialUrl]);

  const handleParse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    parseMutation.mutate({ data: { url } }, {
      onError: (err: any) => {
        toast({
          title: "Failed to parse URL",
          description: err?.error || "Please check the URL and try again.",
          variant: "destructive"
        });
      }
    });
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const triggerFileDownload = (fileUrl: string, filename: string) => {
    // yt-dlp routes already have the full path; image/direct URLs go through proxy
    const href = fileUrl.startsWith("/api/")
      ? `${fileUrl}&filename=${encodeURIComponent(filename)}`
      : `/api/download/proxy?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = (format: any) => {
    const mediaInfo = parseMutation.data;
    if (!mediaInfo || !format.url) return;

    setDownloadingId(format.id);

    const safeTitle = mediaInfo.title.replace(/[^a-z0-9]/gi, "_").slice(0, 50);
    const filename = `${safeTitle}_${format.quality ?? format.label}.${format.extension}`;

    downloadMutation.mutate({
      data: {
        url: mediaInfo.url,
        platform: mediaInfo.platform,
        mediaType: mediaInfo.mediaType,
        title: mediaInfo.title,
        thumbnail: mediaInfo.thumbnail,
        author: mediaInfo.author,
        format: format.label,
        extension: format.extension,
        fileSize: format.size
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Downloading...",
          description: `${format.label} • ${format.size ?? format.extension.toUpperCase()}`
        });
        queryClient.invalidateQueries({ queryKey: getGetRecentDownloadsQueryKey({ limit: 5 }) });
        triggerFileDownload(format.url, filename);
        setDownloadingId(null);
      },
      onError: () => setDownloadingId(null)
    });
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      {/* Header & Input */}
      <div className="flex flex-col gap-6 pt-8">
        <h1 className="text-3xl font-bold">Downloader</h1>
        <form onSubmit={handleParse} className="flex gap-4">
          <Input 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video, audio, or image URL..." 
            className="h-14 text-lg bg-card border-white/10"
          />
          <Button 
            type="submit" 
            size="lg" 
            className="h-14 px-8"
            disabled={parseMutation.isPending || !url.trim()}
          >
            {parseMutation.isPending ? "Analyzing..." : "Analyze"}
          </Button>
        </form>
      </div>

      {/* Results Area */}
      <AnimatePresence mode="wait">
        {parseMutation.isPending && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-[300px_1fr] gap-8"
          >
            <Skeleton className="w-full aspect-video md:aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-32 w-full mt-8" />
            </div>
          </motion.div>
        )}

        {parseMutation.data && !parseMutation.isPending && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-[300px_1fr] gap-8 bg-card border border-white/5 rounded-2xl p-6 shadow-xl"
          >
            {/* Media Preview */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full aspect-video md:aspect-square rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-white/10">
                {parseMutation.data.thumbnail ? (
                  <img src={parseMutation.data.thumbnail} alt={parseMutation.data.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                )}
                {parseMutation.data.duration && (
                  <Badge variant="secondary" className="absolute bottom-2 right-2 bg-black/80 text-white border-none backdrop-blur-md">
                    {Math.floor(parseMutation.data.duration / 60)}:{String(parseMutation.data.duration % 60).padStart(2, '0')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Media Details & Formats */}
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="capitalize border-primary/20 text-primary bg-primary/5">{parseMutation.data.platform}</Badge>
                {parseMutation.data.author && (
                  <Badge variant="outline" className="text-muted-foreground"><User className="w-3 h-3 mr-1" /> {parseMutation.data.author}</Badge>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-6 line-clamp-2">{parseMutation.data.title}</h2>

              <Tabs defaultValue="video" className="w-full mt-auto">
                <TabsList className="w-full justify-start border-b border-white/10 rounded-none bg-transparent h-12 p-0 space-x-6">
                  <TabsTrigger value="video" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">
                    <Video className="w-4 h-4 mr-2" /> Video
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">
                    <Music className="w-4 h-4 mr-2" /> Audio
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="video" className="pt-6 space-y-3">
                  {parseMutation.data.formats.filter(f => f.type === 'video').map(format => (
                    <div key={format.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                      <div className="flex flex-col">
                        <span className="font-medium">{format.label}</span>
                        <span className="text-xs text-muted-foreground uppercase">{format.extension} • {format.size || "Unknown size"}</span>
                      </div>
                      <Button size="sm" onClick={() => handleDownload(format)} disabled={!!downloadingId}>
                        {downloadingId === format.id ? (
                          <><span className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" /> Saving...</>
                        ) : (
                          <><DownloadIcon className="w-4 h-4 mr-2" /> Download</>
                        )}
                      </Button>
                    </div>
                  ))}
                  {parseMutation.data.formats.filter(f => f.type === 'video').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No video formats available</div>
                  )}
                </TabsContent>

                <TabsContent value="audio" className="pt-6 space-y-3">
                  {parseMutation.data.formats.filter(f => f.type === 'audio').map(format => (
                    <div key={format.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                      <div className="flex flex-col">
                        <span className="font-medium">{format.label}</span>
                        <span className="text-xs text-muted-foreground uppercase">{format.extension} • {format.size || "Unknown size"}</span>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => handleDownload(format)} disabled={!!downloadingId}>
                        {downloadingId === format.id ? (
                          <><span className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" /> Saving...</>
                        ) : (
                          <><DownloadIcon className="w-4 h-4 mr-2" /> Download</>
                        )}
                      </Button>
                    </div>
                  ))}
                  {parseMutation.data.formats.filter(f => f.type === 'audio').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No audio formats available</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Downloads */}
      {recentDownloads && recentDownloads.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Clock className="w-5 h-5" /> Recent Activity</h3>
          <div className="grid gap-4">
            {recentDownloads.map((dl) => (
              <Card key={dl.id} className="bg-card/50 border-white/5 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded bg-muted flex-shrink-0 overflow-hidden">
                    {dl.thumbnail ? (
                      <img src={dl.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-6 h-6" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{dl.title}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs py-0 h-5 border-white/10 capitalize">{dl.platform}</Badge>
                      <span className="text-xs text-muted-foreground">{dl.format}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
