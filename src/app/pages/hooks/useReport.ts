"use client";

import { useState, useCallback } from "react";
import { reportService, ReportData, DailyReportData } from "@/app/service/reportService";

export function useReport() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [viewType, setViewType] = useState<"yearly" | "daily">("yearly");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dailyReportData, setDailyReportData] = useState<DailyReportData | null>(null);
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

  const fetchDailyReport = useCallback(async (selectedYear?: number, selectedMonth?: number) => {
    const targetYear = selectedYear ?? year;
    const targetMonth = selectedMonth ?? month;
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getDailyReport(targetYear, targetMonth);
      if (res.success && res.data) {
        setDailyReportData(res.data);
      } else {
        setError(res.message || "Gagal memuat data laporan harian");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  const changeYear = useCallback((newYear: number) => {
    setYear(newYear);
    fetchReport(newYear);
  }, [fetchReport]);

  const changeMonth = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    fetchDailyReport(newYear, newMonth);
  }, [fetchDailyReport]);

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

  // Helper: get max revenue for chart scaling based on viewType
  const maxRevenue = viewType === "yearly"
    ? (reportData ? Math.max(...reportData.monthlyIncome.map((m) => m.revenue), 1) : 1)
    : (dailyReportData ? Math.max(...dailyReportData.dailyIncome.map((d) => d.revenue), 1) : 1);

  return {
    year,
    month,
    viewType,
    setViewType,
    reportData,
    dailyReportData,
    loading,
    error,
    maxRevenue,
    fetchReport,
    fetchDailyReport,
    changeYear,
    changeMonth,
    formatCurrency,
    formatCompact,
  };
}

// ============================================
// Daily Report Hook
// ============================================

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function useDailyReport() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [dailyReportData, setDailyReportData] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyReport = useCallback(async (selectedYear?: number, selectedMonth?: number) => {
    const targetYear = selectedYear ?? year;
    const targetMonth = selectedMonth ?? month;
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getDailyReport(targetYear, targetMonth);
      if (res.success && res.data) {
        setDailyReportData(res.data);
      } else {
        setError(res.message || "Gagal memuat data laporan harian");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  const changeMonth = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    fetchDailyReport(newYear, newMonth);
  }, [fetchDailyReport]);

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
  const maxRevenue = dailyReportData
    ? Math.max(...dailyReportData.dailyIncome.map((d) => d.revenue), 1)
    : 1;

  // Get month name
  const monthName = monthNames[month];

  return {
    year,
    month,
    monthName,
    dailyReportData,
    loading,
    error,
    maxRevenue,
    fetchDailyReport,
    changeMonth,
    formatCurrency,
    formatCompact,
  };
}
