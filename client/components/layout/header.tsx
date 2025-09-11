import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { Zap } from "lucide-react";
import Link from "next/link";
import LogoutDialog from "./logout-dialog";
import ThemeToggle from "./theme-toggle";

const Header = () => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center space-x-2"
        >
          <div className="relative">
            <Zap className="h-8 w-8 text-primary animate-glow" />
          </div>
          <span className="font-heading font-bold text-xl text-gradient">
            Linky
          </span>
        </Link>

        <nav className="flex items-center space-x-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground max-sm:hidden">
                Welcome, {user?.first_name || user?.username}
              </span>
              <LogoutDialog />
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
