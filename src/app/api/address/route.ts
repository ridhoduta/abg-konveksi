import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET /api/address
 * Fetch all addresses for the logged-in customer.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role.toUpperCase() !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Akses ditolak. Anda harus login sebagai Customer." },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: {
        customerId: session.userId,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      data: addresses,
    });
  } catch (error) {
    console.error("Get Addresses Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/address
 * Create a new address for the logged-in customer.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role.toUpperCase() !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Akses ditolak. Anda harus login sebagai Customer." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { label, address, latitude, longitude, isDefault } = body;

    // Validation
    if (!label || !address) {
      return NextResponse.json(
        { message: "Label dan Address wajib diisi." },
        { status: 400 }
      );
    }

    // Jika alamat baru di-set sebagai default, unset default alamat lainnya
    const isNewDefault = isDefault === true || isDefault === "true";
    
    if (isNewDefault) {
      await prisma.address.updateMany({
        where: { customerId: session.userId },
        data: { isDefault: false },
      });
    } else {
      // Jika customer belum punya alamat, otomatis jadikan default yang pertama ini
      const existingAddressesCount = await prisma.address.count({
        where: { customerId: session.userId },
      });
      if (existingAddressesCount === 0) {
        // Force default for the first address
      }
    }
    
    const finalIsDefault = isNewDefault || (await prisma.address.count({ where: { customerId: session.userId } }) === 0);

    const newAddress = await prisma.address.create({
      data: {
        label,
        address,
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
        isDefault: finalIsDefault,
        customerId: session.userId,
      },
    });

    return NextResponse.json(
      {
        message: "Alamat berhasil ditambahkan.",
        data: newAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Address Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
