import { useAuction } from "@/contexts/AuctionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Play } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { auctions, approveAuction, startAuction, endAuction, removeAuction } = useAuction();
  const { toast } = useToast();

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-20 text-muted-foreground">
        You are not authorized to view this page.
      </div>
    );
  }

  const pending = auctions.filter((a) => a.status === "pending");
  const upcoming = auctions.filter((a) => a.status === "upcoming");
  const live = auctions.filter((a) => a.status === "live");
  const ended = auctions.filter((a) => a.status === "ended");

  const handleApprove = (id: string) => {
    approveAuction(id);
    toast({ title: "Approved", description: "Auction has been approved and is now upcoming." });
  };

  const handleStart = (id: string) => {
    startAuction(id);
    toast({ title: "Started", description: "Auction is now live." });
  };

  const handleEnd = (id: string) => {
    endAuction(id);
    toast({ title: "Ended", description: "Auction has been closed." });
  };

  const handleClear = (id: string) => {
    removeAuction(id);
    toast({ title: "Cleared", description: "Ended auction removed." });
  };

  const renderRow = (a: any) => (
    <div key={a.id} className="p-4 flex items-center gap-4">
      <div className="flex-1">
        <p className="font-medium text-foreground">{a.itemName}</p>
        <p className="text-sm text-muted-foreground">
          Seller ID: {a.sellerId}
        </p>
      </div>
      <div className="text-right flex items-center gap-2">
        {a.status === "pending" && (
          <Button size="sm" onClick={() => handleApprove(a.id)}>
            Approve
          </Button>
        )}
        {a.status === "upcoming" && (
          <Button size="sm" onClick={() => handleStart(a.id)}>
            <Play className="h-4 w-4 mr-1" />
            Start Now
          </Button>
        )}
        {a.status === "live" && (
          <Button size="sm" variant="destructive" onClick={() => handleEnd(a.id)}>
            End Auction
          </Button>
        )}
        {a.status === "ended" && (
          <Button size="sm" variant="destructive" onClick={() => handleClear(a.id)}>
            Clear
          </Button>
        )}
        <Badge className="capitalize">{a.status}</Badge>
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Review and manage auctions coming from sellers.
        </p>
      </div>

      {pending.length > 0 && (
        <div className="rounded-xl border bg-card shadow-card mb-6">
          <h3 className="p-4 border-b text-sm font-semibold text-foreground">
            Pending Approvals ({pending.length})
          </h3>
          <div className="divide-y">{pending.map(renderRow)}</div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="rounded-xl border bg-card shadow-card mb-6">
          <h3 className="p-4 border-b text-sm font-semibold text-foreground">
            Upcoming Auctions ({upcoming.length})
          </h3>
          <div className="divide-y">{upcoming.map(renderRow)}</div>
        </div>
      )}

      {live.length > 0 && (
        <div className="rounded-xl border bg-card shadow-card mb-6">
          <h3 className="p-4 border-b text-sm font-semibold text-foreground">
            Live Auctions ({live.length})
          </h3>
          <div className="divide-y">{live.map(renderRow)}</div>
        </div>
      )}

      {ended.length > 0 && (
        <div className="rounded-xl border bg-card shadow-card mb-6">
          <h3 className="p-4 border-b text-sm font-semibold text-foreground">
            Ended Auctions ({ended.length})
          </h3>
          <div className="divide-y">{ended.map(renderRow)}</div>
        </div>
      )}

      {auctions.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No auctions yet</p>
          <p className="text-sm">Waiting for sellers to publish items.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
