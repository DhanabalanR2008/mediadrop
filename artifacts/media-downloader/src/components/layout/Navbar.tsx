import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Download, History, Tag, Info, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    { href: "/", label: "Home" },
    { href: "/downloader", label: "Downloader", icon: Download },
    { href: "/history", label: "History", icon: History },
    { href: "/pricing", label: "Pricing", icon: Tag },
    { href: "/about", label: "About", icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-foreground font-semibold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            <Download className="w-4 h-4" />
          </div>
          MediaDrop
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {routes.slice(1).map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-2 transition-colors ${
                location === route.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <route.icon className="w-4 h-4" />
              {route.label}
            </Link>
          ))}
          <Button variant="default" className="ml-4 rounded-full px-6 font-semibold" asChild>
            <Link href="/downloader">
              Start Downloading <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border py-4 px-4 flex flex-col gap-4 shadow-xl">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                location === route.href ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {route.icon && <route.icon className="w-5 h-5" />}
              {route.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
