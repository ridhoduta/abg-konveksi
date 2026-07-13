import { prisma } from "@/lib/prisma";

export async function cancelExpiredTransferOrders() {
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find all pending orders older than 24 hours that have pending transfer payments
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lte: cutoffTime,
        },
        payment: {
          some: {
            method: "TRANSFER",
            status: "PENDING",
          },
        },
      },
      include: {
        items: true,
      },
    });

    if (expiredOrders.length === 0) {
      return;
    }

    console.log(`[Order Cleanup] Found ${expiredOrders.length} expired transfer orders to cancel.`);

    for (const order of expiredOrders) {
      try {
        await prisma.$transaction(async (tx: any) => {
          // 1. Update order status to CANCELLED
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "CANCELLED",
            },
          });

          // 2. Update order payment status to REJECTED
          await tx.orderPayment.updateMany({
            where: {
              orderId: order.id,
              method: "TRANSFER",
              status: "PENDING",
            },
            data: {
              status: "REJECTED",
            },
          });

          // 3. Restore variant stock
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
            console.log(`[Order Cleanup] Restored stock for variant ID ${item.variantId}: +${item.quantity}`);
          }
        });

        console.log(`[Order Cleanup] Successfully cancelled order ID ${order.id} due to payment timeout.`);

        // 4. Send FCM notification to the customer if customerId is set
        if (order.customerId) {
          try {
            const customerTokens = await prisma.fcmToken.findMany({
              where: { customerId: order.customerId },
              select: { token: true }
            });

            if (customerTokens.length > 0) {
              const tokens = customerTokens.map((t: { token: string }) => t.token);
              const admin = (await import("@/lib/firebase-admin")).default;

              const messages = tokens.map((token: string) => ({
                token,
                notification: {
                  title: "Pesanan Dibatalkan Otomatis",
                  body: `Pesanan #${order.id} Anda telah dibatalkan karena tidak ada pembayaran transfer dalam waktu 24 jam.`,
                },
                data: {
                  orderId: String(order.id),
                  status: "CANCELLED",
                }
              }));

              const response = await admin.messaging().sendEach(messages);
              console.log(`[Order Cleanup] Sent FCM to customer for order #${order.id}. Success: ${response.successCount}, Failed: ${response.failureCount}`);
            }
          } catch (fcmError) {
            console.error(`[Order Cleanup] FCM Notification Error for order #${order.id}:`, fcmError);
          }
        }
      } catch (orderError) {
        console.error(`[Order Cleanup] Failed to cancel order ID ${order.id}:`, orderError);
      }
    }
  } catch (error) {
    console.error("[Order Cleanup] Error in cancelExpiredTransferOrders:", error);
  }
}
