import "./globals.css";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
