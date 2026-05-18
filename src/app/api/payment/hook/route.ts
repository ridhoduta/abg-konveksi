import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Data dari Midtrans
    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
      transaction_id
    } = body;

    // 1. Verifikasi Signature Key untuk keamanan
    // Rumus: SHA512(order_id + status_code + gross_amount + ServerKey)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hashString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    if (hash !== signature_key) {
      console.error("Midtrans Webhook: Invalid signature key");
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    // 2. Parse Order ID (karena dari backend kita mengirim ID murni berupa angka seperti "2")
    const orderIdInt = parseInt(order_id, 10);

    // Mencegah error jika Midtrans mengirimkan notifikasi "Test" dari Dashboard 
    // (yang biasanya menggunakan order_id berupa huruf/UUID)
    if (isNaN(orderIdInt) || orderIdInt > 2147483647) {
      console.log(`Webhook diabaikan: order_id tidak valid atau terlalu besar (${order_id})`);
      return NextResponse.json({ message: "Ignored: Invalid order_id format" }, { status: 200 });
    }

    // 3. Tentukan status dari Midtrans
    let paymentStatusStr = "PENDING";
    let orderPaymentStatus = "UNPAID";

    // Berdasarkan dokumentasi status transaksi Midtrans
    if (transaction_status == 'capture' || transaction_status == 'settlement') {
      if (fraud_status == 'challenge') {
        paymentStatusStr = "PENDING";
      } else if (fraud_status == 'accept' || !fraud_status) {
        paymentStatusStr = "VERIFIED";
        orderPaymentStatus = "PAID";
      }
    } else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire') {
      paymentStatusStr = "REJECTED";
      orderPaymentStatus = "UNPAID";
    } else if (transaction_status == 'pending') {
      paymentStatusStr = "PENDING";
      orderPaymentStatus = "UNPAID";
    }

    // 4. Update tabel OrderPayment
    await prisma.orderPayment.updateMany({
      where: {
        orderId: orderIdInt,
        method: "TRANSFER" // Asumsi semua transaksi Midtrans tercatat sebagai TRANSFER
      },
      data: {
        status: paymentStatusStr,
        reference: transaction_id, // Menyimpan ID Transaksi Midtrans
        paidAt: paymentStatusStr === "VERIFIED" ? new Date() : null,
      }
    });

    // 5. Update tabel Order jika lunas
    if (orderPaymentStatus === "PAID") {
      await prisma.order.update({
        where: { id: orderIdInt },
        data: {
          paymentStatus: orderPaymentStatus,
          // Opsional: Bisa langsung mengubah status order misal menjadi "PROCESSING" (sedang diproses pabrik)
          // status: "PROCESSING" 
        }
      });
    }

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

  } catch (error) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
