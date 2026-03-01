import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gavel, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller" | "admin">("buyer");
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    register(name, email, password, role);
    toast({ title: "Account created!", description: `Welcome to BidPulse, ${name}!` });
    if (role === "seller") navigate("/seller");
    else if (role === "admin") navigate("/admin");
    else navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Gavel className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">Bid<span className="text-primary">Pulse</span></span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1 text-center">Create your account</h1>
        <p className="text-muted-foreground mb-8 text-center">Join BidPulse to start bidding or selling</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>I want to</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  role === "buyer" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                🛒 Buy Items
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  role === "seller" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                🏷️ Sell Items
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                  role === "admin" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
