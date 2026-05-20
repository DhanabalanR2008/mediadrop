import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { setBaseUrl } from "@workspace/api-client-react";
import Home from "@/pages/home";
import Downloader from "@/pages/downloader";
import History from "@/pages/history";
import Pricing from "@/pages/pricing";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";

setBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
function Router() {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col relative">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/downloader" component={Downloader} />
          <Route path="/history" component={History} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;
