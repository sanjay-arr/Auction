import { useState } from "react";
import { useAuction } from "@/contexts/AuctionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";
import { Auction } from "@/data/types";

const SellerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const { auctions: globalAuctions, createAuction } = useAuction();
  const auctions = globalAuctions.filter((a) => a.sellerId === (user?.id || "2"));
  const [form, setForm] = useState({ itemName: "", description: "", basePrice: "", startTime: "", endTime: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName || !form.description || !form.basePrice || !form.startTime || !form.endTime) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    const newAuction: Auction = {
      id: Date.now().toString(),
      itemName: form.itemName,
      description: form.description,
      basePrice: parseInt(form.basePrice),
      currentBid: parseInt(form.basePrice),
      highestBidder: null,
      status: "pending",
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      sellerId: user?.id || "2",
      bidCount: 0,
    };

    createAuction(newAuction);
    setForm({ itemName: "", description: "", basePrice: "", startTime: "", endTime: "" });
    setShowForm(false);
    toast({ title: "Auction Created! 🎉", description: `"${form.itemName}" has been listed.` });
  };

  const statusConfig: Record<string, string> = {
    pending: "bg-gray-200 text-gray-700",
    live: "bg-live text-live-foreground",
    upcoming: "bg-warning text-warning-foreground",
    ended: "bg-muted text-muted-foreground",
  };

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your auctions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Auction
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-card p-6 shadow-card mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">New Auction</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input placeholder="e.g. Vintage Watch" value={form.itemName} onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Brief description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Base Price (₹)</Label>
              <Input type="number" placeholder="5000" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
            </div>
            <div className="md:col-span-2 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Create Auction</Button>
            </div>
          </form>
        </div>
      )}

      {/* Auction list */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="p-4 border-b bg-secondary/30">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="h-4 w-4 text-primary" />
            Your Auctions
            <Badge variant="outline" className="ml-auto">{auctions.length}</Badge>
          </h3>
        </div>
        <div className="divide-y">
          {auctions.map((a) => (
            <div key={a.id} className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-foreground">{a.itemName}</p>
                <p className="text-sm text-muted-foreground">Base: ₹{a.basePrice.toLocaleString()} · {a.bidCount} bids</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-foreground">₹{a.currentBid.toLocaleString()}</p>
                <Badge className={statusConfig[a.status]}>{a.status.toUpperCase()}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
