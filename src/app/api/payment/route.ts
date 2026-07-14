import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR", "CUSTOMER"].includes(session.role.toUpperCase())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        customer: true,
        payment: true,
      }
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Customer can only pay for their own order
    if (session.role.toUpperCase() === "CUSTOMER" && order.customerId !== session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ message: "Order is already paid" }, { status: 400 });
    }

    const transferPayment = order.payment.find((p: any) => p.method === "TRANSFER");
    if (!transferPayment) {
      return NextResponse.json({ message: "Only TRANSFER payment method is supported for Midtrans" }, { status: 400 });
    }

    const amount = transferPayment.amount;

    // INTEGRASI MIDTRANS
    const midtransClient = require("midtrans-client");
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
    });

    const parameter = {
      transaction_details: {
        order_id: `${order.id}-${Date.now()}`,
        gross_amount: amount
      },
      customer_details: {
        first_name: order.customer?.name || "Pelanggan",
        email: order.customer?.email || "customer@example.com"
      }
    };

    const midtransResponse = await snap.createTransaction(parameter);

    return NextResponse.json({
      message: "Payment token generated successfully",
      data: {
        midtrans: midtransResponse
      }
    });
  } catch (error) {
    console.error("Payment Token Generation Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
