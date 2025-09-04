"use client";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          {/* Force dark mode */}
          <Sonner />
          {children}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Providers;
