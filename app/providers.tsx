"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { HomepageConfigProvider } from "@/contexts/HomepageConfigContext";
import { ControlCenterProvider } from "@/contexts/ControlCenterContext";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <HomepageConfigProvider>
              <ControlCenterProvider>
                {children}
              </ControlCenterProvider>
            </HomepageConfigProvider>
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
