// ============================================
// Report Service - Thin API client layer
// ============================================

export interface MonthlyIncome {
  month: string;
  revenue: number;
  ordersCount: number;
}

export interface PaymentMethodStat {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface RecentTransaction {
  id: number;
  orderId: number;
  customerName: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}

export interface ReportData {
  isDemoData: boolean;
  year: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  monthlyGrowthPercentage: number;
  monthlyIncome: MonthlyIncome[];
  paymentMethods: PaymentMethodStat[];
  topProducts: TopProduct[];
  recentTransactions: RecentTransaction[];
}

export const reportService = {
  getIncomeReport: async (year: number) => {
    const res = await fetch(`/api/report?year=${year}`);
    const data = await res.json();
    return {
      success: res.ok,
      data: data.data as ReportData | undefined,
      message: data.message as string,
    };
  },
};
