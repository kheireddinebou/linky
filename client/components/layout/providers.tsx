"use client";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import RoutesProtection from "./routes-protection";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoutesProtection>
          {/* Force dark mode */}
          <Sonner />
          {children}
        </RoutesProtection>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Providers;
