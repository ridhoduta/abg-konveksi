import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR"].includes(session.role.toUpperCase())) {
      return NextResponse.json({ message: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "yearly"; // "yearly" or "daily"
    const currentYear = new Date().getFullYear();

    // ============================================
    // DAILY REPORT
    // ============================================
    if (type === "daily") {
      const yearParam = searchParams.get("year");
      const monthParam = searchParams.get("month");
      const year = yearParam ? parseInt(yearParam, 10) : currentYear;
      const month = monthParam ? parseInt(monthParam, 10) : new Date().getMonth();

      if (isNaN(year) || year < 2000 || year > 2100) {
        return NextResponse.json({ message: "Invalid year parameter" }, { status: 400 });
      }

      if (isNaN(month) || month < 0 || month > 11) {
        return NextResponse.json({ message: "Invalid month parameter" }, { status: 400 });
      }

      // Get the number of days in the selected month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const payments = await prisma.orderPayment.findMany({
        where: {
          status: "VERIFIED",
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: {
          order: {
            include: {
              customer: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const isDemoData = payments.length === 0;

      if (isDemoData) {
        const demoData = generateDailyDemoData(year, month, daysInMonth);
        return NextResponse.json({
          message: "Demo daily report data retrieved successfully",
          data: demoData,
        });
      }

      // Calculate actual daily statistics
      const dailyIncome = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        revenue: 0,
        ordersCount: 0,
      }));

      let totalRevenue = 0;
      const orderIds = new Set<number>();
      const paymentMethodsMap: Record<string, { amount: number; count: number }> = {
        CASH: { amount: 0, count: 0 },
        TRANSFER: { amount: 0, count: 0 },
        COD: { amount: 0, count: 0 },
      };

      payments.forEach((payment: any) => {
        const date = new Date(payment.paidAt || payment.createdAt);
        const dayIndex = date.getDate() - 1;
        
        if (dayIndex >= 0 && dayIndex < daysInMonth) {
          dailyIncome[dayIndex].revenue += payment.amount;
          dailyIncome[dayIndex].ordersCount += 1;
        }

        totalRevenue += payment.amount;
        orderIds.add(payment.orderId);

        const method = (payment.method || "TRANSFER").toUpperCase();
        if (paymentMethodsMap[method]) {
          paymentMethodsMap[method].amount += payment.amount;
          paymentMethodsMap[method].count += 1;
        }
      });

      const totalOrders = orderIds.size;
      const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      // Calculate growth vs previous day
      const today = new Date().getDate() - 1;
      const todayRevenue = today < daysInMonth ? dailyIncome[today]?.revenue || 0 : 0;
      const yesterdayRevenue = today > 0 ? dailyIncome[today - 1]?.revenue || 0 : 0;
      
      let dailyGrowthPercentage = 0;
      if (yesterdayRevenue > 0) {
        dailyGrowthPercentage = Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
      } else if (todayRevenue > 0) {
        dailyGrowthPercentage = 100;
      }

      const paymentMethods = Object.entries(paymentMethodsMap).map(([method, stats]) => ({
        method,
        amount: stats.amount,
        count: stats.count,
        percentage: totalRevenue > 0 ? Math.round((stats.amount / totalRevenue) * 100) : 0,
      }));

      const recentTransactions = payments.slice(0, 10).map((payment: any) => ({
        id: payment.id,
        orderId: payment.orderId,
        customerName: payment.order?.customer?.name || "Pelanggan Guest",
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        date: payment.paidAt || payment.createdAt,
      }));

      return NextResponse.json({
        message: "Daily report data retrieved successfully",
        data: {
          isDemoData: false,
          year,
          month,
          totalRevenue,
          totalOrders,
          averageOrderValue,
          dailyGrowthPercentage,
          dailyIncome,
          paymentMethods,
          recentTransactions,
        },
      });
    }

    // ============================================
    // YEARLY REPORT (existing)
    // ============================================
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : currentYear;

    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ message: "Invalid year parameter" }, { status: 400 });
    }

    // ... (rest of existing yearly code)
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const payments = await prisma.orderPayment.findMany({
      where: {
        status: "VERIFIED",
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      include: {
        order: {
          include: {
            customer: true,
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const isDemoData = payments.length === 0;

    if (isDemoData) {
      const demoData = generateDemoData(year);
      return NextResponse.json({
        message: "Demo report data retrieved successfully",
        data: demoData,
      });
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    
    const monthlyIncome = monthNames.map((name, index) => ({
      monthIndex: index,
      month: name,
      revenue: 0,
      ordersCount: 0,
    }));

    let totalRevenue = 0;
    const orderIds = new Set<number>();
    const paymentMethodsMap: Record<string, { amount: number; count: number }> = {
      CASH: { amount: 0, count: 0 },
      TRANSFER: { amount: 0, count: 0 },
      COD: { amount: 0, count: 0 },
    };

    const productSalesMap: Record<number, { name: string; quantity: number; revenue: number }> = {};

    payments.forEach((payment: any) => {
      const date = new Date(payment.paidAt || payment.createdAt);
      const monthIndex = date.getMonth();
      
      monthlyIncome[monthIndex].revenue += payment.amount;
      monthlyIncome[monthIndex].ordersCount += 1;

      totalRevenue += payment.amount;
      orderIds.add(payment.orderId);

      const method = (payment.method || "TRANSFER").toUpperCase();
      if (paymentMethodsMap[method]) {
        paymentMethodsMap[method].amount += payment.amount;
        paymentMethodsMap[method].count += 1;
      } else {
        paymentMethodsMap[method] = { amount: payment.amount, count: 1 };
      }

      if (payment.order && payment.order.items) {
        payment.order.items.forEach((item: any) => {
          const product = item.variant?.product;
          if (product) {
            if (!productSalesMap[product.id]) {
              productSalesMap[product.id] = {
                name: product.name,
                quantity: 0,
                revenue: 0,
              };
            }
            productSalesMap[product.id].quantity += item.quantity;
            productSalesMap[product.id].revenue += item.quantity * item.price;
          }
        });
      }
    });

    const totalOrders = orderIds.size;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const paymentMethods = Object.entries(paymentMethodsMap).map(([method, stats]) => ({
      method,
      amount: stats.amount,
      count: stats.count,
      percentage: totalRevenue > 0 ? Math.round((stats.amount / totalRevenue) * 100) : 0,
    }));

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const recentTransactions = payments.slice(0, 10).map((payment: any) => ({
      id: payment.id,
      orderId: payment.orderId,
      customerName: payment.order?.customer?.name || "Pelanggan Guest",
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      date: payment.paidAt || payment.createdAt,
    }));

    const currentMonth = new Date().getMonth();
    const currentMonthRevenue = monthlyIncome[currentMonth].revenue;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthRevenue = monthlyIncome[prevMonth].revenue;
    
    let monthlyGrowthPercentage = 0;
    if (prevMonthRevenue > 0) {
      monthlyGrowthPercentage = Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);
    } else if (currentMonthRevenue > 0) {
      monthlyGrowthPercentage = 100;
    }

    return NextResponse.json({
      message: "Report data retrieved successfully",
      data: {
        isDemoData: false,
        year,
        totalRevenue,
        totalOrders,
        averageOrderValue,
        monthlyGrowthPercentage,
        monthlyIncome: monthlyIncome.map(({ month, revenue, ordersCount }) => ({ month, revenue, ordersCount })),
        paymentMethods,
        topProducts,
        recentTransactions,
      },
    });

  } catch (error) {
    console.error("Get Report Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Helper to generate daily demo data
function generateDailyDemoData(year: number, month: number, daysInMonth: number) {
  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();
  const currentDay = new Date().getDate();

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  // Base daily revenues - realistic pattern with weekday peaks
  const baseDailyRevenues = Array.from({ length: daysInMonth }, (_, i) => {
    const dayOfWeek = new Date(year, month, i + 1).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 3500000 : 2200000;
    const variance = Math.random() * 1500000;
    return Math.round(base + variance);
  });

  const dailyIncome = baseDailyRevenues.map((revenue, index) => {
    const isFuture = isCurrentMonth && index + 1 > currentDay;
    const isToday = isCurrentMonth && index + 1 === currentDay;
    
    return {
      day: index + 1,
      revenue: isFuture ? 0 : isToday ? Math.round(revenue * 0.6) : revenue,
      ordersCount: isFuture ? 0 : isToday ? Math.round((revenue / 850000) * 0.6) : Math.round(revenue / 850000),
    };
  });

  const activeDays = dailyIncome.filter(d => d.revenue > 0);
  const totalRevenue = activeDays.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = activeDays.reduce((sum, d) => sum + d.ordersCount, 0);
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Daily growth (today vs yesterday)
  const todayRevenue = dailyIncome[currentDay - 1]?.revenue || 0;
  const yesterdayRevenue = currentDay > 1 ? dailyIncome[currentDay - 2]?.revenue || 0 : 0;
  
  let dailyGrowthPercentage = 8;
  if (yesterdayRevenue > 0) {
    dailyGrowthPercentage = Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
  }

  const paymentMethods = [
    { method: "TRANSFER", amount: Math.round(totalRevenue * 0.60), count: Math.round(totalOrders * 0.58), percentage: 60 },
    { method: "CASH", amount: Math.round(totalRevenue * 0.25), count: Math.round(totalOrders * 0.28), percentage: 25 },
    { method: "COD", amount: Math.round(totalRevenue * 0.15), count: Math.round(totalOrders * 0.14), percentage: 15 },
  ];

  const names = [
    "Ahmad Fauzi", "Rian Hidayat", "Siti Aminah", "Budi Santoso", 
    "Dewi Lestari", "Hendra Wijaya", "Indah Permata", "Roni Setiawan"
  ];
  
  const recentTransactions = Array.from({ length: 6 }).map((_, idx) => {
    const date = new Date(year, month, Math.max(1, currentDay - idx));
    const amount = [1250000, 3200000, 850000, 4500000, 1800000, 2900000][idx % 6];
    const method = ["TRANSFER", "TRANSFER", "CASH", "TRANSFER", "COD", "TRANSFER"][idx % 6];
    
    return {
      id: 2000 + idx,
      orderId: 600 + idx,
      customerName: names[idx % names.length],
      amount,
      method,
      status: "VERIFIED",
      date: date.toISOString(),
    };
  });

  return {
    isDemoData: true,
    year,
    month,
    monthName: monthNames[month],
    totalRevenue,
    totalOrders,
    averageOrderValue,
    dailyGrowthPercentage,
    dailyIncome,
    paymentMethods,
    recentTransactions,
  };
}


// Helper to generate beautifully realistic simulation data for demo mode
function generateDemoData(year: number) {
  const isCurrentYear = year === new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  
  // Base monthly revenue curve to look highly realistic (seasonal dip in Apr/Jul, peak in Dec)
  const baseRevenues = [
    24500000, // Jan
    28200000, // Feb
    32800000, // Mar
    21400000, // Apr (Seasonal drop)
    35600000, // Mei
    42100000, // Jun (Peak season)
    31800000, // Jul
    45200000, // Agt
    48900000, // Sep
    52300000, // Okt
    58000000, // Nov
    68500000, // Des (Holiday peak)
  ];

  const baseOrders = [32, 38, 44, 28, 48, 56, 42, 60, 65, 71, 78, 92];

  const monthlyIncome = monthNames.map((name, index) => {
    // If it is the current year and the month is in the future, return 0 or low values
    const isFuture = isCurrentYear && index > currentMonth;
    const isCurrent = isCurrentYear && index === currentMonth;
    
    return {
      month: name,
      revenue: isFuture ? 0 : isCurrent ? Math.round(baseRevenues[index] * 0.7) : baseRevenues[index],
      ordersCount: isFuture ? 0 : isCurrent ? Math.round(baseOrders[index] * 0.7) : baseOrders[index],
    };
  });

  // Calculate year totals
  const activeMonths = monthlyIncome.filter(m => m.revenue > 0);
  const totalRevenue = activeMonths.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = activeMonths.reduce((sum, m) => sum + m.ordersCount, 0);
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Monthly Growth Percentage
  const currentMonthIdx = isCurrentYear ? currentMonth : 11;
  const currentMonthRevenue = monthlyIncome[currentMonthIdx].revenue;
  const prevMonthRevenue = currentMonthIdx > 0 ? monthlyIncome[currentMonthIdx - 1].revenue : 0;
  
  let monthlyGrowthPercentage = 12; // default healthy trend
  if (prevMonthRevenue > 0) {
    monthlyGrowthPercentage = Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);
  }

  // Payment Methods
  const paymentMethods = [
    { method: "TRANSFER", amount: Math.round(totalRevenue * 0.58), count: Math.round(totalOrders * 0.55), percentage: 58 },
    { method: "CASH", amount: Math.round(totalRevenue * 0.28), count: Math.round(totalOrders * 0.32), percentage: 28 },
    { method: "COD", amount: Math.round(totalRevenue * 0.14), count: Math.round(totalOrders * 0.13), percentage: 14 },
  ];

  // Top Products
  const topProducts = [
    { name: "Kemeja Flanel Premium", quantity: 340, revenue: Math.round(totalRevenue * 0.34) },
    { name: "Kaos Polos Cotton Combed", quantity: 680, revenue: Math.round(totalRevenue * 0.23) },
    { name: "Jaket Hoodie Fleece", quantity: 180, revenue: Math.round(totalRevenue * 0.18) },
    { name: "Celana Chino Slim Fit", quantity: 150, revenue: Math.round(totalRevenue * 0.15) },
    { name: "Poloshirt Lacoste", quantity: 210, revenue: Math.round(totalRevenue * 0.10) },
  ];

  // Recent Transactions
  const names = [
    "Ahmad Fauzi", "Rian Hidayat", "Siti Aminah", "Budi Santoso", 
    "Dewi Lestari", "Hendra Wijaya", "Indah Permata", "Roni Setiawan"
  ];
  
  const recentTransactions = Array.from({ length: 8 }).map((_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - idx);
    const amount = [1250000, 3200000, 850000, 4500000, 1800000, 2900000, 950000, 1500000][idx];
    const method = ["TRANSFER", "TRANSFER", "CASH", "TRANSFER", "COD", "TRANSFER", "CASH", "COD"][idx];
    
    return {
      id: 1000 + idx,
      orderId: 500 + idx,
      customerName: names[idx % names.length],
      amount,
      method,
      status: "VERIFIED",
      date: date.toISOString(),
    };
  });

  return {
    isDemoData: true,
    year,
    totalRevenue,
    totalOrders,
    averageOrderValue,
    monthlyGrowthPercentage,
    monthlyIncome,
    paymentMethods,
    topProducts,
    recentTransactions,
  };
}
