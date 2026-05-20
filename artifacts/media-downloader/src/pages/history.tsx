import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Download as DownloadIcon, Trash2, Search, Video, Music, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useListDownloads, useDeleteDownload, getListDownloadsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryParams = platformFilter === "all" ? undefined : { platform: platformFilter };
  const { data, isLoading } = useListDownloads(queryParams);
  const deleteMutation = useDeleteDownload();

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Record deleted", description: "Download removed from history." });
        queryClient.invalidateQueries({ queryKey: getListDownloadsQueryKey(queryParams) });
      }
    });
  };

  const platforms = ["all", "youtube", "instagram", "tiktok", "twitter"];

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">History</h1>
          <p className="text-muted-foreground">Your complete download archive.</p>
        </div>
        
        <Tabs value={platformFilter} onValueChange={setPlatformFilter} className="w-full md:w-auto overflow-x-auto">
          <TabsList className="bg-card border border-white/5">
            {platforms.map(p => (
              <TabsTrigger key={p} value={p} className="capitalize">
                {p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="w-full h-24 rounded-xl" />
          ))}
        </div>
      ) : data?.downloads && data.downloads.length > 0 ? (
        <div className="grid gap-4">
          {data.downloads.map((dl) => (
            <div key={dl.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-card border border-white/5 hover:border-primary/30 transition-colors">
              <div className="w-full sm:w-32 aspect-video sm:aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
                {dl.thumbnail ? (
                  <img src={dl.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <DownloadIcon className="w-8 h-8 text-muted-foreground/30" />
                )}
              </div>
              
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="capitalize text-xs font-medium">{dl.platform}</Badge>
                  <span className="text-xs text-muted-foreground">{format(new Date(dl.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <h3 className="font-semibold text-lg line-clamp-1 mb-2" title={dl.title}>{dl.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {dl.mediaType === 'video' ? <Video className="w-3 h-3" /> : dl.mediaType === 'audio' ? <Music className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    {dl.format}
                  </span>
                  <span>•</span>
                  <span>{dl.fileSize || "Unknown size"}</span>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" asChild>
                  <a href={dl.url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" /> Source</a>
                </Button>
                <Button variant="destructive" size="sm" className="flex-1 sm:flex-none" onClick={() => handleDelete(dl.id)} disabled={deleteMutation.isPending}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card border border-dashed border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No downloads found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {platformFilter === 'all' 
              ? "You haven't downloaded anything yet. Start saving media to see it here."
              : `You haven't downloaded any media from ${platformFilter} yet.`}
          </p>
          <Button asChild>
            <Link href="/downloader">Go to Downloader</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
