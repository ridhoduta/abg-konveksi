"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "./context/CartContext";
import { KasirSidebar } from "@/components/kasirSidebar";

export default function KasirLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Determine activePath dynamically from the current pathname
  let activePath = "home";
  if (pathname.startsWith("/pages/kasir/order")) {
    activePath = "order";
  } else if (pathname.startsWith("/pages/kasir/report")) {
    activePath = "report";
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-on-background overflow-x-hidden">
        <KasirSidebar activePath={activePath} />
        {children}
      </div>
    </CartProvider>
  );
}

