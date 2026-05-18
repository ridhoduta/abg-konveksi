"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, AuthUser } from "@/app/service/authService";
import { AdminSidebar } from "@/components/adminSidebar";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await authService.getMe();
      if (res.success && res.data && res.data.role === "ADMIN") {
        setUser(res.data);
      } else {
        router.push("/pages/login");
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="spinner !border-primary !border-t-transparent"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface-dim font-sans text-on-surface">
      <AdminSidebar activePath="dashboard" />

      {/* Main Content Area */}
      <main className="flex-1 p-xl overflow-y-auto ml-72">
        <header className="flex justify-between items-center mb-xl bg-surface-container-lowest p-lg border border-outline-variant rounded-sm shadow-sm">
          <h1 className="headline-lg">Dashboard Overview</h1>
          <div className="flex items-center gap-md">
            <div className="text-right">
              <p className="label-md m-0">{user?.username}</p>
              <p className="label-sm text-on-surface-variant m-0">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-surface-container-highest rounded-full border border-outline-variant flex items-center justify-center font-bold text-primary">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Operational Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-sm shadow-sm border-l-4 border-l-primary">
            <h3 className="label-sm text-on-surface-variant mb-xs">TOTAL PESANAN</h3>
            <p className="headline-md m-0">1,234</p>
            <p className="label-sm text-tertiary mt-xs">↑ 12% vs last month</p>
          </div>
          <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-sm shadow-sm border-l-4 border-l-secondary">
            <h3 className="label-sm text-on-surface-variant mb-xs">TOTAL PRODUK</h3>
            <p className="headline-md m-0">56</p>
            <p className="label-sm opacity-60 mt-xs">Active in catalog</p>
          </div>
          <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-sm shadow-sm border-l-4 border-l-tertiary">
            <h3 className="label-sm text-on-surface-variant mb-xs">PENDAPATAN</h3>
            <p className="headline-md m-0">Rp 150.000.000</p>
            <p className="label-sm text-tertiary mt-xs">Confirmed transactions</p>
          </div>
        </section>

        {/* Recent Activities Placeholder */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-sm shadow-sm overflow-hidden">
          <div className="bg-surface-container-low px-lg py-md border-b border-outline-variant">
            <h2 className="label-md">Recent Operational Logs</h2>
          </div>
          <div className="p-xl text-center opacity-30">
            <p className="body-md italic">No recent logs found in high-precision mode.</p>
          </div>
        </section>
      </main>
    </div>
  );
}