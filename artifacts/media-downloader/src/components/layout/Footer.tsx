import { Link } from "wouter";
import { Download, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background py-12 md:py-16 mt-auto relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-foreground font-semibold text-lg tracking-tight inline-flex">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <Download className="w-4 h-4" />
              </div>
              MediaDrop
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              The premium media downloader for power users. Save videos, audio, and images from anywhere on the web in pristine quality.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/downloader" className="hover:text-primary transition-colors">Downloader</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/history" className="hover:text-primary transition-colors">History</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MediaDrop Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
