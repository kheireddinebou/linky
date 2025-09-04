import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Zap } from "lucide-react";
import Link from "next/link";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative">
            <Zap className="h-8 w-8 text-primary animate-glow" />
          </div>
          <span className="font-heading font-bold text-xl text-gradient">
            Linky
          </span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground max-sm:hidden">
                Welcome, {user?.first_name || user?.username}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
