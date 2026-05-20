import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * POST /api/order/customer
 * Registers a new Customer in the system.
 * Accessible by anyone (public registration) or by ADMIN/KASIR to manually register customers.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { googleId, email, name, avatar, phone, addresses } = body;

    // 1. Validasi Input Minimum
    if (!name) {
      return NextResponse.json(
        { message: "Nama wajib diisi" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Karena googleId unik & wajib di skema database, generate jika tidak dikirim (misal pendaftaran manual)
    const finalGoogleId = googleId || `manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 2. Cek apakah customer dengan email atau googleId ini sudah terdaftar
    const existingEmail = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    if (googleId) {
      const existingGoogleId = await prisma.customer.findUnique({
        where: { googleId },
      });

      if (existingGoogleId) {
        return NextResponse.json(
          { message: "Google ID sudah terdaftar" },
          { status: 409 }
        );
      }
    }

    // 3. Persiapkan nested write untuk Addresses jika dikirimkan
    let addressCreateData = undefined;
    if (addresses && Array.isArray(addresses) && addresses.length > 0) {
      addressCreateData = {
        create: addresses.map((addr: any) => ({
          label: addr.label || "Alamat",
          address: addr.address || "",
          latitude: Number(addr.latitude) || 0,
          longitude: Number(addr.longitude) || 0,
          isDefault: addr.isDefault === true || addr.isDefault === "true",
        })),
      };
    }

    // 4. Buat Customer Baru
    const newCustomer = await prisma.customer.create({
      data: {
        googleId: finalGoogleId,
        email,
        name,
        avatar: avatar || null,
        phone: phone || null,
        addresses: addressCreateData,
      },
      include: {
        addresses: true,
      },
    });

    return NextResponse.json(
      {
        message: "Customer berhasil diregistrasikan",
        data: newCustomer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer Registration Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/order/customer
 * Fetches all customers.
 * Restricted to ADMIN and KASIR only.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR"].includes(session.role.toUpperCase())) {
      return NextResponse.json(
        { message: "Akses ditolak. Hanya Admin atau Kasir yang dapat mengakses data ini." },
        { status: 403 }
      );
    }

    const customers = await prisma.customer.findMany({
      include: {
        addresses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: customers,
    });
  } catch (error) {
    console.error("Fetch Customers Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
