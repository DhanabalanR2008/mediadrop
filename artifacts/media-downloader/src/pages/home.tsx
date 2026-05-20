import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Download, Zap, Shield, Sparkles } from "lucide-react";
import { FaYoutube, FaInstagram, FaTiktok, FaTwitter, FaFacebook, FaPinterest, FaReddit, FaVimeo, FaSoundcloud } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetStatsSummary, useGetPlatformBreakdown } from "@workspace/api-client-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [, setLocation] = useLocation();

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      setLocation(`/downloader?url=${encodeURIComponent(url)}`);
    }
  };

  const { data: stats } = useGetStatsSummary();
  const { data: platforms } = useGetPlatformBreakdown();

  return (
    <div className="flex-1 w-full flex flex-col relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> The Next Generation Media Downloader
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Save Media from <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Anywhere on the Web</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl">
            A premium, frictionless tool for power users. Paste a link from YouTube, Instagram, TikTok, or Twitter, and get your file instantly in pristine quality.
          </p>

          <form onSubmit={handleDownload} className="w-full max-w-2xl flex flex-col md:flex-row gap-4 relative">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <Input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste media URL here..." 
                className="h-16 text-lg px-6 rounded-xl bg-background/50 backdrop-blur-sm border-white/10 hover:border-white/20 focus:border-primary transition-all shadow-2xl relative z-10 w-full"
              />
            </div>
            <Button type="submit" size="lg" className="h-16 px-8 rounded-xl text-lg font-semibold shadow-lg hover:shadow-primary/25 transition-all w-full md:w-auto shrink-0 z-10">
              Download <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>
        </motion.div>
      </section>

      {/* Platforms Grid */}
      <section className="py-20 bg-background/50 border-y border-white/5 relative z-10">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-10">Supported Platforms</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <FaYoutube className="w-8 h-8 hover:text-red-500 transition-colors" />
            <FaInstagram className="w-8 h-8 hover:text-pink-500 transition-colors" />
            <FaTiktok className="w-8 h-8 hover:text-white transition-colors" />
            <FaTwitter className="w-8 h-8 hover:text-blue-400 transition-colors" />
            <FaFacebook className="w-8 h-8 hover:text-blue-600 transition-colors" />
            <FaPinterest className="w-8 h-8 hover:text-red-600 transition-colors" />
            <FaReddit className="w-8 h-8 hover:text-orange-500 transition-colors" />
            <FaVimeo className="w-8 h-8 hover:text-blue-400 transition-colors" />
            <FaSoundcloud className="w-8 h-8 hover:text-orange-400 transition-colors" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Engineered for Speed</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">We cut out the clutter so you can focus on what matters. No ads, no popups, just your content.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Our global CDN ensures you get the fastest possible download speeds, no matter where you are." },
              { icon: Shield, title: "Secure & Private", desc: "We don't track what you download. Your history is yours alone, stored securely on your device." },
              { icon: Download, title: "Maximum Quality", desc: "Get up to 4K video and lossless audio. If the platform has it, we can extract it." }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-card border-y border-white/5 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stats?.totalDownloads || "10M+"}</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Downloads</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">{stats?.totalVideos || "8M+"}</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Videos Saved</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">{stats?.totalAudios || "2M+"}</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Audio Tracks</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">{platforms?.length || "30+"}</div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Platforms</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
