import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { cancelExpiredTransferOrders } from "@/lib/order";

export async function GET(req: NextRequest, props: { params: Promise<{ customerid: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR", "CUSTOMER"].includes(session.role.toUpperCase())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Cancel transfer orders that have been pending for >= 24 hours
    await cancelExpiredTransferOrders();

    const customerId = Number(params.customerid);
    if (isNaN(customerId)) {
      return NextResponse.json({ message: "Invalid customer ID" }, { status: 400 });
    }

    // Customer can only access their own orders
    if (session.role.toUpperCase() === "CUSTOMER" && session.userId !== customerId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            variant: {
              include: { product: true, size: true }
            }
          }
        },
        payment: true,
        createdBy: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error("Get Customer Orders Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
