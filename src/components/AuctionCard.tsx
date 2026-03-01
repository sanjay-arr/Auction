import { Auction } from "@/data/types";
import { useCountdown } from "@/hooks/useCountdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-gray-200 text-gray-700" },
  live: { label: "LIVE", className: "bg-live text-live-foreground animate-pulse-live" },
  upcoming: { label: "Upcoming", className: "bg-warning text-warning-foreground" },
  ended: { label: "Ended", className: "bg-muted text-muted-foreground" },
};

const AuctionCard = ({ auction }: { auction: Auction }) => {
  const navigate = useNavigate();
  const { timeLeft } = useCountdown(auction.endTime);
  const config = statusConfig[auction.status];

  return (
    <div className="group rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-card-foreground line-clamp-1">{auction.itemName}</h3>
        <Badge className={config.className}>{config.label}</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{auction.description}</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">Current Bid</span>
          <span className="text-lg font-bold font-mono text-primary">₹{auction.currentBid.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {auction.status === "live" && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-live" />
              <span className="font-mono font-medium text-foreground">{timeLeft}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{auction.bidCount} bids</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Base: ₹{auction.basePrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={() => navigate(`/auction/${auction.id}`)}
        className="w-full mt-4"
        variant={auction.status === "live" ? "default" : "outline"}
        disabled={auction.status === "pending"}
      >
        {auction.status === "live"
          ? "Join Auction"
          : auction.status === "upcoming"
          ? "View Details"
          : auction.status === "pending"
          ? "Pending"
          : "View Results"}
      </Button>
    </div>
  );
};

export default AuctionCard;
