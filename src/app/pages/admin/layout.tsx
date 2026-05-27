"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/adminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine activePath dynamically from the current pathname
  let activePath = "dashboard";
  if (pathname.startsWith("/pages/admin/product")) {
    activePath = "produk";
  } else if (pathname.startsWith("/pages/admin/order")) {
    activePath = "pesanan";
  } else if (pathname.startsWith("/pages/admin/user")) {
    activePath = "users";
  } else if (pathname.startsWith("/pages/admin/report")) {
    activePath = "laporan";
  }

  return (
    <div className="flex min-h-screen bg-white-120font-sans text-on-surface">
      <AdminSidebar activePath={activePath} />
      {children}
    </div>
  );
}
