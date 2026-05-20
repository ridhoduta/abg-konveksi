"use client";

import { useEffect, useState } from "react";
import { useReport } from "../../hooks/useReport";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  BarChart3,
  ArrowUpRight,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  CreditCard,
  Banknote,
  Truck,
  Trophy,
} from "lucide-react";

// ============================================
// CUSTOM SVG CHART COMPONENT
// ============================================

function RevenueChart({
  data,
  maxRevenue,
  formatCompact,
  formatCurrency,
}: {
  data: { month: string; revenue: number; ordersCount: number }[];
  maxRevenue: number;
  formatCompact: (n: number) => string;
  formatCurrency: (n: number) => string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const chartWidth = 800;
  const chartHeight = 320;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 50;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const barWidth = Math.min(40, (plotWidth / data.length) * 0.6);
  const barGap = plotWidth / data.length;

  // Y-axis grid lines
  const gridLines = 5;
  const gridStep = maxRevenue / gridLines;

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full min-w-[600px]"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-container)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
          <filter id="barShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--primary)" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Grid lines */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = paddingTop + plotHeight - (i * plotHeight) / gridLines;
          const value = gridStep * i;
          return (
            <g key={`grid-${i}`}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="var(--outline-variant)"
                strokeWidth="1"
                strokeDasharray={i === 0 ? "0" : "4 4"}
                opacity={i === 0 ? 0.6 : 0.3}
              />
              <text
                x={paddingLeft - 12}
                y={y + 4}
                textAnchor="end"
                fill="var(--on-surface-variant)"
                fontSize="11"
                fontWeight="500"
              >
                {formatCompact(value)}
              </text>
            </g>
          );
        })}

        {/* Area fill under curve */}
        <path
          d={`
            M ${paddingLeft + barGap * 0.5} ${paddingTop + plotHeight - (data[0]?.revenue / maxRevenue) * plotHeight}
            ${data.map((d, i) => {
              const x = paddingLeft + barGap * i + barGap * 0.5;
              const y = paddingTop + plotHeight - (d.revenue / maxRevenue) * plotHeight;
              return `L ${x} ${y}`;
            }).join(" ")}
            L ${paddingLeft + barGap * (data.length - 1) + barGap * 0.5} ${paddingTop + plotHeight}
            L ${paddingLeft + barGap * 0.5} ${paddingTop + plotHeight}
            Z
          `}
          fill="url(#areaGradient)"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const x = paddingLeft + barGap * i + (barGap - barWidth) / 2;
          const barHeight = maxRevenue > 0 ? (d.revenue / maxRevenue) * plotHeight : 0;
          const y = paddingTop + plotHeight - barHeight;
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={`bar-${i}`}
              onMouseEnter={(e) => {
                setHoveredIndex(i);
                const svgRect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                const relX = ((x + barWidth / 2) / chartWidth) * svgRect.width;
                const relY = (y / chartHeight) * svgRect.height;
                setTooltipPos({ x: relX, y: relY });
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={4}
                ry={4}
                fill={isHovered ? "url(#barGradientHover)" : "url(#barGradient)"}
                filter={isHovered ? "url(#barShadow)" : undefined}
                style={{
                  transition: "all 0.2s ease-out",
                  transform: isHovered ? "scaleY(1.02)" : "scaleY(1)",
                  transformOrigin: `${x + barWidth / 2}px ${paddingTop + plotHeight}px`,
                }}
              />
              {/* Invisible wider hit area for easier hover */}
              <rect
                x={paddingLeft + barGap * i}
                y={paddingTop}
                width={barGap}
                height={plotHeight}
                fill="transparent"
              />
              {/* Month label */}
              <text
                x={x + barWidth / 2}
                y={paddingTop + plotHeight + 22}
                textAnchor="middle"
                fill={isHovered ? "var(--primary)" : "var(--on-surface-variant)"}
                fontSize="12"
                fontWeight={isHovered ? "700" : "500"}
              >
                {d.month}
              </text>
              {/* Value label on top of bar when hovered */}
              {isHovered && barHeight > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fill="var(--primary)"
                  fontSize="11"
                  fontWeight="700"
                >
                  {formatCompact(d.revenue)}
                </text>
              )}
            </g>
          );
        })}

        {/* Trend line connecting the tops of bars */}
        <polyline
          points={data
            .map((d, i) => {
              const x = paddingLeft + barGap * i + barGap * 0.5;
              const y = paddingTop + plotHeight - (d.revenue / maxRevenue) * plotHeight;
              return `${x},${y}`;
            })
            .join(" ")}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />

        {/* Dots on trend line */}
        {data.map((d, i) => {
          const x = paddingLeft + barGap * i + barGap * 0.5;
          const y = paddingTop + plotHeight - (d.revenue / maxRevenue) * plotHeight;
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r={hoveredIndex === i ? 5 : 3}
              fill={hoveredIndex === i ? "var(--secondary-container)" : "var(--secondary)"}
              stroke="var(--surface-container-lowest)"
              strokeWidth="2"
              style={{ transition: "all 0.2s ease-out" }}
            />
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 10,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-on-surface text-surface-container-lowest px-4 py-3 rounded-xl shadow-lg text-center"
            style={{ minWidth: "160px" }}
          >
            <p className="label-sm opacity-70 mb-1">{data[hoveredIndex].month} {new Date().getFullYear()}</p>
            <p className="label-md font-bold">{formatCurrency(data[hoveredIndex].revenue)}</p>
            <p className="label-sm opacity-70 mt-1">{data[hoveredIndex].ordersCount} pesanan</p>
            <div
              className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                bottom: "-6px",
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid var(--on-surface)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PAYMENT METHOD ICON HELPER
// ============================================

function PaymentMethodIcon({ method }: { method: string }) {
  switch (method.toUpperCase()) {
    case "TRANSFER":
      return <CreditCard className="w-5 h-5" />;
    case "CASH":
      return <Banknote className="w-5 h-5" />;
    case "COD":
      return <Truck className="w-5 h-5" />;
    default:
      return <DollarSign className="w-5 h-5" />;
  }
}

function methodColor(method: string) {
  switch (method.toUpperCase()) {
    case "TRANSFER":
      return { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary" };
    case "CASH":
      return { bg: "bg-tertiary/10", text: "text-tertiary", bar: "bg-tertiary" };
    case "COD":
      return { bg: "bg-secondary/10", text: "text-secondary", bar: "bg-secondary" };
    default:
      return { bg: "bg-outline/10", text: "text-on-surface", bar: "bg-outline" };
  }
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ReportPage() {
  const {
    year,
    reportData,
    loading,
    error,
    maxRevenue,
    fetchReport,
    changeYear,
    formatCurrency,
    formatCompact,
  } = useReport();

  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !reportData) {
    return (
      <main className="flex-1 p-xl overflow-y-auto ml-72">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="label-md text-on-surface-variant">Memuat data laporan...</p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error && !reportData) {
    return (
      <main className="flex-1 p-xl overflow-y-auto ml-72">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-error-container p-xl rounded-xl max-w-md">
            <AlertTriangle className="w-10 h-10 text-error mx-auto mb-4" />
            <p className="label-md text-on-error-container mb-4">{error}</p>
            <button onClick={() => fetchReport()} className="btn-primary">
              Coba Lagi
            </button>
          </div>
        </div>
      </main>
    );
  }

  const data = reportData;

  return (
    <main className="flex-1 p-xl overflow-y-auto ml-72">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="flex justify-between items-center mb-xl bg-surface-container-lowest p-lg border border-outline-variant rounded-sm shadow-sm">
        <div>
          <h1 className="headline-lg">Laporan Pemasukan</h1>
          <p className="label-sm text-on-surface-variant mt-1">Analisis pendapatan dan performa bulanan</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Year Selector */}
          <div className="relative">
            <button
              onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-lg label-md hover:bg-surface-container-high transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-primary" />
              Tahun {year}
              <ChevronDown className={`w-4 h-4 transition-transform ${yearDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {yearDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-50 overflow-hidden min-w-[140px]">
                {yearOptions.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      changeYear(y);
                      setYearDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 label-md transition-colors ${
                      y === year
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Refresh */}
          <button
            onClick={() => fetchReport()}
            disabled={loading}
            className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 text-on-surface-variant ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* ============================================ */}
      {/* DEMO DATA INDICATOR */}
      {/* ============================================ */}
      {data?.isDemoData && (
        <div className="mb-lg flex items-center gap-3 px-lg py-sm bg-secondary/5 border border-secondary/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0" />
          <p className="label-sm text-secondary">
            <span className="font-bold">Mode Simulasi</span> — Data yang ditampilkan adalah contoh realistis. Data asli akan muncul otomatis setelah ada transaksi terverifikasi.
          </p>
        </div>
      )}

      {data && (
        <>
          {/* ============================================ */}
          {/* KPI SCORECARD GRID */}
          {/* ============================================ */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
            {/* Total Revenue */}
            <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-lg shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                {data.monthlyGrowthPercentage >= 0 ? (
                  <span className="flex items-center gap-1 label-sm text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    +{data.monthlyGrowthPercentage}%
                  </span>
                ) : (
                  <span className="flex items-center gap-1 label-sm text-error bg-error/10 px-2 py-1 rounded-full">
                    <TrendingDown className="w-3 h-3" />
                    {data.monthlyGrowthPercentage}%
                  </span>
                )}
              </div>
              <p className="label-sm text-on-surface-variant mb-1">Total Pendapatan</p>
              <p className="headline-md font-bold">{formatCurrency(data.totalRevenue)}</p>
            </div>

            {/* Total Orders */}
            <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-lg shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-5 h-5 text-secondary" />
                </div>
              </div>
              <p className="label-sm text-on-surface-variant mb-1">Total Transaksi</p>
              <p className="headline-md font-bold">{data.totalOrders.toLocaleString("id-ID")}</p>
            </div>

            {/* Average Order Value */}
            <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-lg shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5 text-tertiary" />
                </div>
              </div>
              <p className="label-sm text-on-surface-variant mb-1">Rata-rata Transaksi</p>
              <p className="headline-md font-bold">{formatCurrency(data.averageOrderValue)}</p>
            </div>

            {/* Growth */}
            <div className="bg-surface-container-lowest p-lg border border-outline-variant rounded-lg shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                  data.monthlyGrowthPercentage >= 0 ? "bg-tertiary/10" : "bg-error/10"
                }`}>
                  {data.monthlyGrowthPercentage >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-tertiary" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-error" />
                  )}
                </div>
              </div>
              <p className="label-sm text-on-surface-variant mb-1">Pertumbuhan Bulan Ini</p>
              <p className={`headline-md font-bold ${
                data.monthlyGrowthPercentage >= 0 ? "text-tertiary" : "text-error"
              }`}>
                {data.monthlyGrowthPercentage >= 0 ? "+" : ""}{data.monthlyGrowthPercentage}%
              </p>
            </div>
          </section>

          {/* ============================================ */}
          {/* INTERACTIVE REVENUE CHART */}
          {/* ============================================ */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm mb-xl overflow-hidden">
            <div className="p-lg border-b border-outline-variant bg-surface-container-low/50 flex items-center justify-between">
              <div>
                <h2 className="label-md">Grafik Pendapatan Bulanan</h2>
                <p className="label-sm text-on-surface-variant mt-0.5">Tren pemasukan tahun {data.year}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                  <span className="label-sm text-on-surface-variant">Pendapatan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full bg-secondary" />
                  <span className="label-sm text-on-surface-variant">Tren</span>
                </div>
              </div>
            </div>
            <div className="p-lg">
              <RevenueChart
                data={data.monthlyIncome}
                maxRevenue={maxRevenue}
                formatCompact={formatCompact}
                formatCurrency={formatCurrency}
              />
            </div>
          </section>

          {/* ============================================ */}
          {/* DOUBLE INSIGHTS PANEL */}
          {/* ============================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-xl">
            {/* Payment Method Distribution */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
              <div className="p-lg border-b border-outline-variant bg-surface-container-low/50">
                <h2 className="label-md">Distribusi Metode Pembayaran</h2>
                <p className="label-sm text-on-surface-variant mt-0.5">Berdasarkan jumlah pendapatan</p>
              </div>
              <div className="p-lg space-y-5">
                {data.paymentMethods.map((pm) => {
                  const colors = methodColor(pm.method);
                  return (
                    <div key={pm.method}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors.bg} ${colors.text}`}>
                            <PaymentMethodIcon method={pm.method} />
                          </div>
                          <div>
                            <p className="label-md">{pm.method}</p>
                            <p className="label-sm text-on-surface-variant">{pm.count} transaksi</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="label-md font-bold">{formatCurrency(pm.amount)}</p>
                          <p className={`label-sm font-bold ${colors.text}`}>{pm.percentage}%</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
                          style={{ width: `${pm.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Top Products Leaderboard */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
              <div className="p-lg border-b border-outline-variant bg-surface-container-low/50">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-secondary" />
                  <h2 className="label-md">Produk Terlaris</h2>
                </div>
                <p className="label-sm text-on-surface-variant mt-0.5">Berdasarkan kontribusi pendapatan</p>
              </div>
              <div className="p-lg">
                {data.topProducts.length === 0 ? (
                  <p className="body-md text-on-surface-variant text-center py-8 italic opacity-50">Belum ada data produk</p>
                ) : (
                  <div className="space-y-4">
                    {data.topProducts.map((product, index) => {
                      const maxProductRevenue = data.topProducts[0]?.revenue || 1;
                      const percentage = Math.round((product.revenue / maxProductRevenue) * 100);
                      const rankColors = [
                        "bg-secondary text-on-secondary",
                        "bg-primary text-on-primary",
                        "bg-tertiary text-on-tertiary",
                        "bg-outline text-surface-container-lowest",
                        "bg-outline-variant text-on-surface",
                      ];
                      return (
                        <div key={index} className="group">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center label-sm font-bold flex-shrink-0 ${rankColors[index] || rankColors[4]}`}
                            >
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="label-md truncate group-hover:text-primary transition-colors">{product.name}</p>
                              <p className="label-sm text-on-surface-variant">{product.quantity} terjual</p>
                            </div>
                            <p className="label-md font-bold flex-shrink-0">{formatCurrency(product.revenue)}</p>
                          </div>
                          <div className="ml-10 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/40 transition-all duration-700 ease-out"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ============================================ */}
          {/* RECENT TRANSACTIONS TABLE */}
          {/* ============================================ */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="p-lg border-b border-outline-variant bg-surface-container-low/50 flex items-center justify-between">
              <div>
                <h2 className="label-md">Transaksi Terakhir</h2>
                <p className="label-sm text-on-surface-variant mt-0.5">Pembayaran yang sudah terverifikasi</p>
              </div>
            </div>

            {data.recentTransactions.length === 0 ? (
              <div className="p-xl text-center">
                <p className="body-md text-on-surface-variant italic opacity-50">Belum ada transaksi terverifikasi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="text-left px-lg py-sm label-sm text-on-surface-variant font-semibold">ID</th>
                      <th className="text-left px-lg py-sm label-sm text-on-surface-variant font-semibold">Pelanggan</th>
                      <th className="text-left px-lg py-sm label-sm text-on-surface-variant font-semibold">Jumlah</th>
                      <th className="text-left px-lg py-sm label-sm text-on-surface-variant font-semibold">Metode</th>
                      <th className="text-left px-lg py-sm label-sm text-on-surface-variant font-semibold">Status</th>
                      <th className="text-left px-lg py-sm label-sm text-on-surface-variant font-semibold">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTransactions.map((tx) => {
                      const colors = methodColor(tx.method);
                      return (
                        <tr
                          key={tx.id}
                          className="border-b border-outline-variant/50 hover:bg-surface-container-low/40 transition-colors"
                        >
                          <td className="px-lg py-sm">
                            <span className="label-sm text-on-surface-variant">#{tx.orderId}</span>
                          </td>
                          <td className="px-lg py-sm">
                            <p className="label-md">{tx.customerName}</p>
                          </td>
                          <td className="px-lg py-sm">
                            <p className="label-md font-bold">{formatCurrency(tx.amount)}</p>
                          </td>
                          <td className="px-lg py-sm">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full label-sm font-bold ${colors.bg} ${colors.text}`}>
                              <PaymentMethodIcon method={tx.method} />
                              {tx.method}
                            </span>
                          </td>
                          <td className="px-lg py-sm">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full label-sm font-bold bg-tertiary/10 text-tertiary">
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-lg py-sm">
                            <p className="label-sm text-on-surface-variant">
                              {new Date(tx.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
