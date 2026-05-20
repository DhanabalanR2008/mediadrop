import { Download, Globe, Shield, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 py-20 flex flex-col gap-16">
      <section className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-8">
          <Download className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About MediaDrop</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          We built MediaDrop because existing downloader tools are cluttered with ads, full of malware, or simply don't work. We believe professionals deserve better tools.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-8">
        <div className="bg-card border border-white/5 p-6 rounded-2xl">
          <Zap className="w-8 h-8 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Uncompromising Speed</h3>
          <p className="text-muted-foreground leading-relaxed">Our custom extraction engine bypasses rate limits to deliver your files at the maximum speed your connection allows.</p>
        </div>
        <div className="bg-card border border-white/5 p-6 rounded-2xl">
          <Shield className="w-8 h-8 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
          <p className="text-muted-foreground leading-relaxed">We don't log your downloads, we don't sell your data, and we don't serve third-party ads. Your workflow stays yours.</p>
        </div>
        <div className="bg-card border border-white/5 p-6 rounded-2xl sm:col-span-2">
          <Globe className="w-8 h-8 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Universal Compatibility</h3>
          <p className="text-muted-foreground leading-relaxed">
            MediaDrop supports extracting high-fidelity media from over 30+ platforms including:
            YouTube, Vimeo, Instagram, TikTok, Twitter/X, Facebook, Reddit, Pinterest, SoundCloud, and Twitch.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 pt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to upgrade your workflow?</h2>
        <p className="text-muted-foreground mb-8">Join thousands of creators who trust MediaDrop daily.</p>
      </section>
    </div>
  );
}
