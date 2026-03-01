import { useAuction } from "@/contexts/AuctionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Gavel } from "lucide-react";

const MyBidsPage = () => {
  const { user } = useAuth();
  const { bids } = useAuction();

  if (user?.role !== "buyer") {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Only buyers can view bid history.
      </div>
    );
  }

  const userBids = bids.filter((b) => b.bidderName === user?.name);

  return (
    <div className="animate-slide-up">
      <h1 className="text-3xl font-bold text-foreground mb-2">My Bids</h1>
      <p className="text-muted-foreground mb-8">Your bidding history across all auctions</p>

      {userBids.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Gavel className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No bids yet</p>
          <p className="text-sm">Start bidding on live auctions!</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="divide-y">
            {userBids.map((bid) => (
              <div key={bid.id} className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Gavel className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Auction #{bid.auctionId}</p>
                  <p className="text-sm text-muted-foreground">{new Date(bid.time).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-foreground">₹{bid.amount.toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs">Placed</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBidsPage;
