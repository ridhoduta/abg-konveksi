"use client";

import { useState, useCallback } from "react";
import { reportService, ReportData } from "@/app/service/reportService";

export function useReport() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<number>(currentYear);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (selectedYear?: number) => {
    const targetYear = selectedYear ?? year;
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getIncomeReport(targetYear);
      if (res.success && res.data) {
        setReportData(res.data);
      } else {
        setError(res.message || "Gagal memuat data laporan");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [year]);

  const changeYear = useCallback((newYear: number) => {
    setYear(newYear);
    fetchReport(newYear);
  }, [fetchReport]);

  // Helper: format IDR currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Helper: format compact number (e.g., 48.9jt)
  const formatCompact = useCallback((amount: number) => {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}jt`;
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(0)}rb`;
    }
    return amount.toString();
  }, []);

  // Helper: get max revenue for chart scaling
  const maxRevenue = reportData
    ? Math.max(...reportData.monthlyIncome.map((m) => m.revenue), 1)
    : 1;

  return {
    year,
    reportData,
    loading,
    error,
    maxRevenue,
    fetchReport,
    changeYear,
    formatCurrency,
    formatCompact,
  };
}
