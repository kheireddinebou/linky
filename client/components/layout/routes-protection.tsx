"use client";

import { useAuthStore } from "@/store/auth";
import {
  useRouter,
  useSelectedLayoutSegment,
  usePathname,
} from "next/navigation";
import { useEffect } from "react";

interface RoutesProtectionProps {
  children: React.ReactNode;
}

const RoutesProtection = ({ children }: RoutesProtectionProps) => {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const pathname = usePathname();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated && segment === "(dashboard)") {
      return router.replace("/login");
    }

    if (isAuthenticated && (segment === "(auth)" || pathname === "/")) {
      return router.replace("/dashboard");
    }
  }, [isAuthenticated, hasHydrated, router]);

  return <>{children}</>;
};

export default RoutesProtection;
