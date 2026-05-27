"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, AuthUser } from "@/app/service/authService";
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, Package,
  Clock, CreditCard, Banknote, Truck, BarChart3, RefreshCw,
  ArrowUpRight, CheckCircle2, XCircle, Loader2, ImageOff
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface DashboardData {
  stats: {
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
    totalRevenue: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueGrowth: number;
    ordersThisMonth: number;
    ordersLastMonth: number;
    ordersGrowth: number;
  };
  ordersByStatus: Record<string, number>;
  paymentMethods: { method: string; amount: number; count: number; percentage: number }[];
  recentOrders: {
    id: number;
    status: string;
    paymentStatus: string;
    total: number;
    itemsCount: number;
    createdAt: string;
    customer: { name: string; email: string; avatar: string | null } | null;
  }[];
  topProducts: { name: string; image: string | null; quantity: number; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)} Rb`;
  return fmt(n);
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "Menunggu",    color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  PROCESSING: { label: "Diproses",   color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  SHIPPED:    { label: "Dikirim",     color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  DELIVERED:  { label: "Selesai",    color: "text-green-600",  bg: "bg-green-50 border-green-200" },
  CANCELLED:  { label: "Dibatalkan", color: "text-red-500",    bg: "bg-red-50 border-red-200" },
};

const PAYMENT_ICONS: Record<string, typeof CreditCard> = {
  TRANSFER: CreditCard,
  CASH:     Banknote,
  COD:      Truck,
};

const PAYMENT_COLOR: Record<string, string> = {
  TRANSFER: "text-blue-500",
  CASH:     "text-green-500",
  COD:      "text-orange-500",
};

// ─── Sparkline Bar Chart ──────────────────────────────────────────────────────
function BarSparkline({ data }: { data: { month: string; revenue: number; orders: number }[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 w-full">
      {data.map((d, i) => {
        const height = Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 8 : 2);
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 hidden group-hover:block bg-on-surface text-surface text-[10px] rounded-lg px-2 py-1 whitespace-nowrap shadow-lg pointer-events-none">
              <div className="font-semibold">{fmtShort(d.revenue)}</div>
              <div className="opacity-70">{d.orders} pesanan</div>
            </div>
            <div
              className={`w-full rounded-t-sm transition-all duration-300 ${
                isLast ? "bg-primary" : "bg-primary/30 group-hover:bg-primary/60"
              }`}
              style={{ height: `${height}%` }}
            />
            <span className="text-[9px] text-on-surface-variant">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title, value, sub, growth, icon: Icon, accent,
}: {
  title: string;
  value: string;
  sub?: string;
  growth?: number;
  icon: React.ElementType;
  accent: string;
}) {
  const isPositive = (growth ?? 0) >= 0;
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-lg shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      {/* Background glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${accent}`} />

      <div className="flex items-center justify-between">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">{title}</p>
        <div className={`p-2.5 rounded-xl ${accent} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${accent.replace("bg-", "text-")}`} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold text-on-surface tracking-tight">{value}</p>
        {sub && <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>}
      </div>

      {growth !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isPositive ? "+" : ""}{growth}% vs bulan lalu
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    authService.getMe().then((res) => {
      if (res.success && res.data?.role === "ADMIN") {
        setUser(res.data);
      } else {
        router.push("/pages/login");
      }
      setAuthLoading(false);
    });
  }, [router]);

  const fetchDashboard = async () => {
    setDataLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchDashboard();
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="spinner !border-primary !border-t-transparent" />
      </div>
    );
  }

  const s = data?.stats;

  return (
    <main className="flex-1 p-xl overflow-y-auto ml-72 bg-surface-container-low/30 min-h-screen">

      {/* ── Header ── */}
      <header className="flex justify-between items-center mb-xl bg-surface-container-lowest p-lg border border-outline-variant rounded-2xl shadow-sm">
        <div>
          <h1 className="headline-md font-bold text-on-surface">Dashboard Overview</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {lastUpdated
              ? `Diperbarui ${lastUpdated.toLocaleTimeString("id-ID")}`
              : "Memuat data..."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchDashboard}
            disabled={dataLoading}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl text-sm font-medium hover:bg-surface-container transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-on-surface">{user?.username}</p>
              <p className="text-xs text-on-surface-variant">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full border-2 border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {dataLoading && !data ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-on-surface-variant text-sm">Memuat data dashboard...</p>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
            <StatCard
              title="Total Pendapatan"
              value={fmtShort(s?.totalRevenue ?? 0)}
              sub={`Bulan ini: ${fmtShort(s?.revenueThisMonth ?? 0)}`}
              growth={s?.revenueGrowth}
              icon={BarChart3}
              accent="bg-primary"
            />
            <StatCard
              title="Total Pesanan"
              value={(s?.totalOrders ?? 0).toLocaleString("id-ID")}
              sub={`Bulan ini: ${s?.ordersThisMonth ?? 0} pesanan`}
              growth={s?.ordersGrowth}
              icon={ShoppingBag}
              accent="bg-secondary"
            />
            <StatCard
              title="Total Pelanggan"
              value={(s?.totalCustomers ?? 0).toLocaleString("id-ID")}
              sub="Pelanggan terdaftar"
              icon={Users}
              accent="bg-tertiary"
            />
            <StatCard
              title="Menunggu Konfirmasi"
              value={(s?.pendingOrders ?? 0).toLocaleString("id-ID")}
              sub={`Dari ${s?.totalProducts ?? 0} produk aktif`}
              icon={Clock}
              accent="bg-error"
            />
          </section>

          <div className="grid grid-cols-12 gap-gutter">

            {/* ── Left Column (8 cols) ── */}
            <div className="col-span-12 lg:col-span-8 space-y-gutter">

              {/* Revenue Chart */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-lg shadow-sm">
                <div className="flex justify-between items-start mb-lg">
                  <div>
                    <h2 className="font-semibold text-on-surface">Pendapatan 6 Bulan Terakhir</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">Berdasarkan pembayaran terverifikasi</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{fmtShort(s?.revenueThisMonth ?? 0)}</p>
                    <p className="text-xs text-on-surface-variant">Bulan ini</p>
                  </div>
                </div>
                {data?.monthlyRevenue && <BarSparkline data={data.monthlyRevenue} />}
              </div>

              {/* Recent Orders */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="flex justify-between items-center px-lg py-md border-b border-outline-variant">
                  <h2 className="font-semibold text-on-surface">Pesanan Terbaru</h2>
                  <button
                    onClick={() => router.push("/pages/admin/order")}
                    className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                  >
                    Lihat semua <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-outline-variant">
                  {(data?.recentOrders ?? []).length === 0 ? (
                    <div className="p-lg text-center text-sm text-on-surface-variant">Belum ada pesanan</div>
                  ) : (
                    data?.recentOrders.map((order) => {
                      const sc = STATUS_CONFIG[order.status] ?? {
                        label: order.status, color: "text-on-surface-variant", bg: "bg-surface-container border-outline-variant",
                      };
                      const initial = order.customer?.name?.[0]?.toUpperCase() ?? "?";
                      return (
                        <div key={order.id} className="flex items-center gap-4 px-lg py-3 hover:bg-surface-container-low/50 transition-colors">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                            {order.customer?.avatar ? (
                              <img src={order.customer.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                            ) : initial}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">
                              {order.customer?.name ?? "Pelanggan"}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              #{String(order.id).padStart(4, "0")} · {order.itemsCount} item · {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-on-surface">{fmtShort(order.total)}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>
                              {sc.label}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* ── Right Column (4 cols) ── */}
            <div className="col-span-12 lg:col-span-4 space-y-gutter">

              {/* Order Status Breakdown */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-lg shadow-sm">
                <h2 className="font-semibold text-on-surface mb-md">Status Pesanan</h2>
                <div className="space-y-2.5">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const count = data?.ordersByStatus[key] ?? 0;
                    const total = s?.totalOrders ?? 1;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-xs text-on-surface-variant font-medium">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${cfg.color.replace("text-", "bg-")}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-lg shadow-sm">
                <h2 className="font-semibold text-on-surface mb-md">Metode Pembayaran</h2>
                <div className="space-y-3">
                  {(data?.paymentMethods ?? []).length === 0 ? (
                    <p className="text-sm text-on-surface-variant text-center py-2">Belum ada data</p>
                  ) : (
                    data?.paymentMethods.map((pm) => {
                      const Icon = PAYMENT_ICONS[pm.method] ?? CreditCard;
                      const color = PAYMENT_COLOR[pm.method] ?? "text-on-surface-variant";
                      return (
                        <div key={pm.method} className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-surface-container ${color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-xs font-semibold text-on-surface">{pm.method}</span>
                              <span className="text-xs text-on-surface-variant">{pm.percentage}%</span>
                            </div>
                            <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${color.replace("text-", "bg-")}`}
                                style={{ width: `${pm.percentage}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">{fmtShort(pm.amount)} · {pm.count}x</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-lg shadow-sm">
                <div className="flex justify-between items-center mb-md">
                  <h2 className="font-semibold text-on-surface">Produk Terlaris</h2>
                  <Package className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="space-y-3">
                  {(data?.topProducts ?? []).length === 0 ? (
                    <p className="text-sm text-on-surface-variant text-center py-2">Belum ada data penjualan</p>
                  ) : (
                    data?.topProducts.map((product, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {/* Rank */}
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                          i === 0 ? "bg-yellow-100 text-yellow-700" :
                          i === 1 ? "bg-slate-100 text-slate-600" :
                          i === 2 ? "bg-orange-100 text-orange-600" : "bg-surface-container text-on-surface-variant"
                        }`}>
                          {i + 1}
                        </span>
                        {/* Image */}
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff className="w-3.5 h-3.5 text-outline-variant" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-on-surface truncate">{product.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{product.quantity} terjual</p>
                        </div>
                        <p className="text-xs font-bold text-primary flex-shrink-0">{fmtShort(product.revenue)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </main>
  );
}