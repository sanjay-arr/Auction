import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuction } from "@/contexts/AuctionContext";
import { useCountdown } from "@/hooks/useCountdown";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Bid } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, User, AlertCircle, Trophy, Gavel, ArrowUp } from "lucide-react";

const LiveAuctionPage = () => {
  const { id } = useParams<{ id: string }>();
  const { auctions, bids: globalBids, placeBid } = useAuction();
  const auction = auctions.find((a) => a.id === id);
  const { user } = useAuth();
  const { toast } = useToast();
  const { timeLeft, isExpired } = useCountdown(auction?.endTime || "");

  const bids = globalBids.filter((b) => b.auctionId === id);
  const currentBid = auction?.currentBid || 0;
  const highestBidder = auction?.highestBidder || "";
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");

  const isLive = auction?.status === "live" && !isExpired;
  const isEnded = auction?.status === "ended" || isExpired;
  const canBid = user?.role === "buyer";

  const handlePlaceBid = useCallback(() => {
    setError("");
    const amount = parseInt(bidAmount);

    if (!amount || isNaN(amount)) {
      setError("Please enter a valid bid amount.");
      return;
    }
    if (amount <= currentBid) {
      setError(`Bid must be higher than current bid of ₹${currentBid.toLocaleString()}`);
      return;
    }
    if (isEnded) {
      setError("This auction has ended.");
      toast({ title: "Auction Ended", description: "You cannot place bids on ended auctions.", variant: "destructive" });
      return;
    }

    placeBid(id!, amount, user?.name || "Anonymous");
    setBidAmount("");

    toast({ title: "Bid Placed! 🎉", description: `Your bid of ₹${amount.toLocaleString()} has been placed.` });
  }, [bidAmount, currentBid, isEnded, id, user, toast, placeBid]);

  if (!auction) {
    return <div className="text-center py-20 text-muted-foreground">Auction not found.</div>;
  }

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Badge className={isLive ? "bg-live text-live-foreground animate-pulse-live" : isEnded ? "bg-muted text-muted-foreground" : "bg-warning text-warning-foreground"}>
          {isLive ? "🔴 LIVE" : isEnded ? "ENDED" : "UPCOMING"}
        </Badge>
        <h1 className="text-2xl font-bold text-foreground">{auction.itemName}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Item Details */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Item Details</h2>
            <p className="text-foreground mb-4">{auction.description}</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span className="font-mono font-semibold text-foreground">₹{auction.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start Time</span>
                <span className="text-foreground">{new Date(auction.startTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">End Time</span>
                <span className="text-foreground">{new Date(auction.endTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Bids</span>
                <span className="font-mono font-semibold text-foreground">{bids.length}</span>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="rounded-xl border bg-card p-5 shadow-card text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Time Remaining</span>
            </div>
            <div className={`text-4xl font-mono font-bold ${isLive ? "text-live" : "text-muted-foreground"}`}>
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Center: Current Bid + Winner */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Highest Bid</p>
              <p className="text-5xl font-bold font-mono text-primary animate-count-pulse">₹{currentBid.toLocaleString()}</p>
              {highestBidder && (
                <div className="mt-3 flex items-center justify-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{highestBidder}</span>
                  <Badge variant="outline" className="text-xs">Highest Bidder</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Winner display */}
          {isEnded && highestBidder && (
            <div className="rounded-xl border-2 border-success bg-success/5 p-6 text-center">
              <Trophy className="h-10 w-10 text-success mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">Auction Ended!</h3>
              <p className="text-muted-foreground text-sm mb-3">Winner</p>
              <p className="text-xl font-bold text-foreground">{highestBidder}</p>
              <p className="text-2xl font-bold font-mono text-success mt-1">₹{currentBid.toLocaleString()}</p>
            </div>
          )}

          {/* Bid input */}
          {isLive && canBid && (
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                <Gavel className="h-4 w-4" />
                Place Your Bid
              </h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`Min ₹${(currentBid + 100).toLocaleString()}`}
                  value={bidAmount}
                  onChange={(e) => { setBidAmount(e.target.value); setError(""); }}
                  className="font-mono"
                />
                <Button onClick={handlePlaceBid} className="shrink-0">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  Bid
                </Button>
              </div>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">Minimum increment: ₹100</p>
            </div>
          )}
          {isLive && !canBid && (
            <div className="rounded-xl border bg-card p-5 shadow-card text-center text-muted-foreground">
              <p>Only buyers may place bids.</p>
            </div>
          )}
        </div>

        {/* Right: Bid History */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b bg-secondary/30">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Bid History
              <Badge variant="outline" className="ml-auto text-xs">{bids.length} bids</Badge>
            </h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {bids.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No bids yet</div>
            ) : (
              <div className="divide-y">
                {bids.map((bid, i) => (
                  <div key={bid.id} className={`p-3 flex items-center gap-3 ${i === 0 ? "bg-primary/5" : ""}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}>
                      {i === 0 ? "👑" : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{bid.bidderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bid.time).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="text-sm font-bold font-mono text-foreground">₹{bid.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAuctionPage;
