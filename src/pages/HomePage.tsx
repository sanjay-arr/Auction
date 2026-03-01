import { useState } from "react";
import { useAuction } from "@/contexts/AuctionContext";
import { useAuth } from "@/contexts/AuthContext";
import AuctionCard from "@/components/AuctionCard";
import { Badge } from "@/components/ui/badge";
import { Radio, TrendingUp, Users } from "lucide-react";

type Filter = "all" | "live" | "upcoming" | "ended";

const HomePage = () => {
  const { auctions } = useAuction();
  const [filter, setFilter] = useState<Filter>("all");

  const { user } = useAuth();
  // buyers should not see pending auctions
  const visibleAuctions = user?.role === "buyer" ? auctions.filter((a) => a.status !== "pending") : auctions;
  const filtered = filter === "all" ? visibleAuctions : visibleAuctions.filter((a) => a.status === filter);
  const liveCount = visibleAuctions.filter((a) => a.status === "live").length;
  const title = user ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard` : 'Auction Dashboard';

  return (
    <div className="animate-slide-up">
      {/* Hero stats */}
      <div className="mb-8 rounded-xl p-6 glass-card shadow-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">Discover and bid on unique items in real-time</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-4 shadow-card glass-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-live/10">
              <Radio className="h-5 w-5 text-live" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{liveCount}</p>
              <p className="text-xs text-muted-foreground">Live Auctions</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-card glass-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{auctions.length}</p>
              <p className="text-xs text-muted-foreground">Total Auctions</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-card glass-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">
                {auctions.reduce((sum, a) => sum + a.bidCount, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Bids</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "live", "upcoming", "ended"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "live" && liveCount > 0 && (
              <Badge className="ml-2 bg-live/20 text-live text-xs px-1.5">{liveCount}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No auctions available</p>
          <p className="text-sm">Check back soon for new items</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
