import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Gavel, Home, Radio, LayoutDashboard, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Gavel className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Bid<span className="text-primary">Pulse</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className={navLinkClass("/")}>
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link to="/auctions" className={navLinkClass("/auctions")}>
            <Radio className="h-4 w-4" />
            Live Auctions
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className={navLinkClass("/admin")}>
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </Link>
          )}
          {user?.role === "seller" && (
            <Link to="/seller" className={navLinkClass("/seller")}>
              <LayoutDashboard className="h-4 w-4" />
              My Auctions
            </Link>
          )}
          {user?.role === "buyer" && (
            <Link to="/my-bids" className={navLinkClass("/my-bids")}>
              <LayoutDashboard className="h-4 w-4" />
              My Bids
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium text-secondary-foreground">{user?.name}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
              {user?.role}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
