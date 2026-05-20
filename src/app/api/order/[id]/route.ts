import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR", "CUSTOMER"].includes(session.role.toUpperCase())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(params.id) },
      include: {
        customer: true,
        address: true,
        createdBy: { select: { id: true, username: true } },
        items: {
          include: {
            variant: {
              include: { product: true, size: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (session.role.toUpperCase() === "CUSTOMER" && order.customerId !== session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("Get Order Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR"].includes(session.role.toUpperCase())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, note } = body;

    // Fetch the current order first to check if the status changed and to get customerId
    const oldOrder = await prisma.order.findUnique({
      where: { id: Number(params.id) },
      select: { status: true, customerId: true }
    });

    if (!oldOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id: Number(params.id) },
      data: {
        ...(status && { status }),
        ...(note !== undefined && { note })
      }
    });

    // Send FCM notification if status is updated and customer is set
    if (status && status !== oldOrder.status && oldOrder.customerId) {
      try {
        const customerTokens = await prisma.fcmToken.findMany({
          where: { customerId: oldOrder.customerId },
          select: { token: true }
        });

        if (customerTokens.length > 0) {
          const tokens = customerTokens.map((t) => t.token);

          // Dynamically import firebase-admin
          const admin = (await import("@/lib/firebase-admin")).default;

          const messages = tokens.map((token) => ({
            token,
            notification: {
              title: "Update Status Pesanan",
              body: `Pesanan #${order.id} Anda telah berubah status menjadi: ${status}`,
            },
            data: {
              orderId: String(order.id),
              status: status,
            }
          }));

          const response = await admin.messaging().sendEach(messages);
          console.log(`Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`);

          // Clean up invalid/unregistered tokens
          const tokensToDelete: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const errCode = resp.error?.code;
              if (
                errCode === "messaging/invalid-registration-token" ||
                errCode === "messaging/registration-token-not-registered"
              ) {
                tokensToDelete.push(tokens[idx]);
              }
            }
          });

          if (tokensToDelete.length > 0) {
            await prisma.fcmToken.deleteMany({
              where: {
                token: { in: tokensToDelete }
              }
            });
            console.log(`Cleaned up ${tokensToDelete.length} invalid FCM tokens.`);
          }
        }
      } catch (fcmError) {
        console.error("FCM Notification Error:", fcmError);
      }
    }

    return NextResponse.json({ message: "Order updated successfully", data: order });
  } catch (error) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR"].includes(session.role.toUpperCase())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.order.delete({
      where: { id: Number(params.id) }
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}