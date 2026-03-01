import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAuction } from "@/contexts/AuctionContext";
import { mockUsers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Gavel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller" | "admin">("buyer");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { auctions, bids } = useAuction();
  const { toast } = useToast();

  const liveCount = auctions.filter((a) => a.status === "live").length;
  const bidCount = bids.length;
  const userCount = mockUsers.length;

  const StatCard = ({ label, value }: { label: string; value: number }) => (
    <div className="rounded-lg border border-navy-light p-4">
      <div className="text-2xl font-bold text-primary mb-1">{value}</div>
      <div>{label}</div>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    const success = login(email, password, role);
    if (success) {
      toast({ title: "Welcome back!", description: "You have been logged in successfully." });
      if (role === "seller") navigate("/seller");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    } else {
      toast({ title: "Login failed", description: "No matching user found. Please register first.", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col items-center justify-center p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Gavel className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="text-3xl font-bold text-navy-foreground">
            Bid<span className="text-primary">Pulse</span>
          </span>
        </div>
        <p className="text-center text-lg text-navy-foreground/70 max-w-md">
          Real-time auction platform with live bidding, instant updates, and transparent transactions.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 text-sm text-navy-foreground/60">
          <StatCard label="Live Auctions" value={liveCount} />
          <StatCard label="Registered Users" value={userCount} />
          <StatCard label="Total Bids" value={bidCount} />
          <div className="rounded-lg border border-navy-light p-4">
            <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
            <div>Uptime</div>
          </div>
        </div>
      </div>

      {/* right panel */}
      <div className="flex flex-1 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-1 text-center">Welcome back</h1>
          <p className="text-muted-foreground mb-4 text-center">Sign in to your account</p>

          <div className="mb-4">
            <Label>I am logging in as</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(["buyer", "seller", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg border-2 p-2 text-sm font-medium transition-all ${
                    role === r
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? {" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

