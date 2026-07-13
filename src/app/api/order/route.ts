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
    const { 
      items, customerId, addressId, note, total, 
      addressLabel, newAddress, latitude, longitude,
      paymentMethod, proofOfPayment, amountPaid
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Order items cannot be empty" }, { status: 400 });
    }

    if (!paymentMethod || !["CASH", "TRANSFER", "COD"].includes(paymentMethod)) {
      return NextResponse.json({ message: "Invalid or missing payment method. Must be CASH, TRANSFER, or COD" }, { status: 400 });
    }

    let finalCustomerId = customerId ? Number(customerId) : null;
    if (session.role.toUpperCase() === "CUSTOMER") {
      finalCustomerId = session.userId;
    }
    
    let finalAddressId = addressId ? Number(addressId) : null;

    // Handle nested route concept: creating address inside order creation
    if (!finalAddressId && newAddress) {
      // If no customerId provided but we need an address, create a guest customer first
      // because Address model requires a customerId
      if (!finalCustomerId) {
        const guestCustomer = await prisma.customer.create({
          data: {
            name: "Guest " + Date.now(),
            email: "guest_" + Date.now() + "@guest.com",
            googleId: "guest_" + Date.now(),
            phone: "-"
          }
        });
        finalCustomerId = guestCustomer.id;
      }

      const createdAddress = await prisma.address.create({
        data: {
          label: addressLabel || "Alamat",
          address: newAddress,
          latitude: Number(latitude) || 0,
          longitude: Number(longitude) || 0,
          customerId: finalCustomerId,
        }
      });
      finalAddressId = createdAddress.id;
    }

    // Tentukan status awal berdasarkan metode pembayaran
    let initialOrderPaymentStatus = "UNPAID";
    let initialPaymentStatus = "PENDING";
    let paidAt = null;

    if (paymentMethod === "CASH") {
      initialOrderPaymentStatus = "PAID";
      initialPaymentStatus = "VERIFIED";
      paidAt = new Date();
    }
    
    const finalAmount = amountPaid ? Number(amountPaid) : Number(total);

    // Validate stock and create order in transaction
    const order = await prisma.$transaction(async (tx : any) => {
      // Check stock availability for all items
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: Number(item.variantId) }
        });

        if (!variant) {
          throw new Error(`Variant with ID ${item.variantId} not found`);
        }

        if (variant.stock < Number(item.quantity)) {
          throw new Error(`Insufficient stock for variant ${variant.size.name}. Available: ${variant.stock}, Requested: ${item.quantity}`);
        }
      }

      // Create order with stock reduction
      const createdOrder = await tx.order.create({
        data: {
          userId: ["ADMIN", "KASIR"].includes(session.role.toUpperCase()) ? session.userId : null,
          customerId: finalCustomerId,
          addressId: finalAddressId,
          total: Number(total),
          note: note || null,
          status: "PENDING",
          paymentStatus: initialOrderPaymentStatus,
          items: {
            create: items.map((item: any) => ({
              variantId: Number(item.variantId),
              quantity: Number(item.quantity),
              price: Number(item.price)
            }))
          },
          payment: {
            create: {
              amount: finalAmount,
              method: paymentMethod,
              status: initialPaymentStatus,
              proofOfPayment: paymentMethod === "TRANSFER" ? proofOfPayment : null,
              paidAt: paidAt
            }
          }
        },
        include: {
          items: true,
          customer: true,
          address: true,
          payment: true,
        }
      });

      // Reduce stock for each variant
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: Number(item.variantId) },
          data: {
            stock: {
              decrement: Number(item.quantity)
            }
          }
        });
      }

      return createdOrder;
    });

    // INTEGRASI MIDTRANS
    let midtransResponse = null;

    if (paymentMethod === "TRANSFER") {
      try {
        // Menggunakan require untuk menghindari error TS "Cannot find name"
        const midtransClient = require("midtrans-client");
        
        const snap = new midtransClient.Snap({
          isProduction: false, // ganti ke true jika production
          serverKey: process.env.MIDTRANS_SERVER_KEY || "",
          clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
        });

        const parameter = {
          transaction_details: {
            order_id: order.id.toString(), // Akan ditangkap webhook nanti
            gross_amount: finalAmount
          },
          customer_details: {
            first_name: order.customer?.name || "Pelanggan",
            email: order.customer?.email || "customer@example.com"
          }
        };

        // Buat transaksi di Midtrans
        midtransResponse = await snap.createTransaction(parameter);
        
      } catch (err) {
        console.error("Gagal membuat transaksi Midtrans:", err);
        // Kita tidak mereturn error agar pesanan tetap terbuat, tapi client harus tahu midtrans gagal
      }
    }

    return NextResponse.json({ 
      message: "Order created successfully", 
      data: {
        ...order,
        midtrans: midtransResponse // Mengirim token dan redirect_url ke frontend di dalam obj data
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR", "CUSTOMER"].includes(session.role.toUpperCase())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: session.role.toUpperCase() === "CUSTOMER" ? { customerId: session.userId } : undefined,
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
        createdBy: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error("Get Orders Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}