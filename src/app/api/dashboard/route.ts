import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Run all queries concurrently for performance
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      ordersThisMonth,
      ordersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      totalRevenue,
      ordersByStatus,
      paymentMethods,
      recentOrders,
      topProducts,
      monthlyRevenue,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),

      // Total customers
      prisma.customer.count(),

      // Total products
      prisma.product.count(),

      // Pending orders
      prisma.order.count({ where: { status: "PENDING" } }),

      // Orders this month
      prisma.order.count({
        where: { createdAt: { gte: startOfThisMonth } },
      }),

      // Orders last month
      prisma.order.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),

      // Revenue this month (from verified payments)
      prisma.orderPayment.aggregate({
        where: {
          status: "VERIFIED",
          createdAt: { gte: startOfThisMonth },
        },
        _sum: { amount: true },
      }),

      // Revenue last month
      prisma.orderPayment.aggregate({
        where: {
          status: "VERIFIED",
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),

      // Total all-time verified revenue
      prisma.orderPayment.aggregate({
        where: { status: "VERIFIED" },
        _sum: { amount: true },
      }),

      // Orders grouped by status
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),

      // Payment methods breakdown (verified only)
      prisma.orderPayment.groupBy({
        by: ["method"],
        where: { status: "VERIFIED" },
        _sum: { amount: true },
        _count: { _all: true },
      }),

      // Recent 8 orders
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
          customer: {
            select: { name: true, email: true, avatar: true },
          },
          items: {
            select: { quantity: true },
          },
        },
      }),

      // Top 5 products by quantity sold
      prisma.orderItem.groupBy({
        by: ["variantId"],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 20, // grab more to account for aggregation
      }).then(async (items: any) => {
        // Enrich with product info
        const enriched = await Promise.all(
          items.map(async (item: any) => {
            const variant = await prisma.productVariant.findUnique({
              where: { id: item.variantId },
              include: { 
                product: { 
                  select: { 
                    id: true, 
                    name: true,
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                      select: { url: true }
                    }
                  } 
                } 
              },
            });
            const primaryImage = variant?.product.images?.[0]?.url ?? null;
            return {
              productId: variant?.product.id,
              name: variant?.product.name ?? "Unknown",
              image: primaryImage,
              quantity: item._sum.quantity ?? 0,
              revenue: (item._sum.quantity ?? 0) * (item._sum.price ?? 0),
            };
          })
        );
        // Merge duplicates by productId
        const merged: Record<number, { name: string; image: string | null; quantity: number; revenue: number }> = {};
        for (const item of enriched) {
          if (!item.productId) continue;
          if (!merged[item.productId]) {
            merged[item.productId] = { name: item.name, image: item.image, quantity: 0, revenue: 0 };
          }
          merged[item.productId].quantity += item.quantity;
          merged[item.productId].revenue += item.revenue;
        }
        return Object.values(merged)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
      }),

      // Last 6 months revenue
      (async () => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const start = new Date(d.getFullYear(), d.getMonth(), 1);
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
          const result = await prisma.orderPayment.aggregate({
            where: { status: "VERIFIED", createdAt: { gte: start, lte: end } },
            _sum: { amount: true },
          });
          const orderCount = await prisma.order.count({
            where: { createdAt: { gte: start, lte: end } },
          });
          const monthName = d.toLocaleString("id-ID", { month: "short" });
          months.push({
            month: monthName,
            revenue: result._sum.amount ?? 0,
            orders: orderCount,
          });
        }
        return months;
      })(),
    ]);

    // Compute growth percentages
    const revenueThisMonthVal = revenueThisMonth._sum.amount ?? 0;
    const revenueLastMonthVal = revenueLastMonth._sum.amount ?? 0;
    const revenueGrowth =
      revenueLastMonthVal > 0
        ? Math.round(((revenueThisMonthVal - revenueLastMonthVal) / revenueLastMonthVal) * 100)
        : revenueThisMonthVal > 0 ? 100 : 0;

    const ordersGrowth =
      ordersLastMonth > 0
        ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100)
        : ordersThisMonth > 0 ? 100 : 0;

    // Format ordersByStatus as a map
    const statusMap: Record<string, number> = {};
    for (const s of ordersByStatus) {
      statusMap[s.status] = s._count._all;
    }

    // Format paymentMethods
    const totalVerifiedRevenue = totalRevenue._sum.amount ?? 0;
    const formattedPaymentMethods = paymentMethods.map((pm:any) => ({
      method: pm.method,
      amount: pm._sum.amount ?? 0,
      count: pm._count._all,
      percentage:
        totalVerifiedRevenue > 0
          ? Math.round(((pm._sum.amount ?? 0) / totalVerifiedRevenue) * 100)
          : 0,
    }));

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order: any) => ({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      itemsCount: order.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
      createdAt: order.createdAt,
      customer: order.customer
        ? { name: order.customer.name, email: order.customer.email, avatar: order.customer.avatar }
        : null,
    }));

    return NextResponse.json({
      stats: {
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        totalRevenue: totalVerifiedRevenue,
        revenueThisMonth: revenueThisMonthVal,
        revenueLastMonth: revenueLastMonthVal,
        revenueGrowth,
        ordersThisMonth,
        ordersLastMonth,
        ordersGrowth,
      },
      ordersByStatus: statusMap,
      paymentMethods: formattedPaymentMethods,
      recentOrders: formattedRecentOrders,
      topProducts,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
