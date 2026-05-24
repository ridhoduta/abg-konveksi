import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, getSession, encrypt } from "@/lib/session";

// POST /api/auth/customer/login — Login Customer
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Cari customer berdasarkan email (email unik di schema)
    const customer = await prisma.customer.findUnique({
      where: { email },
      include: { addresses: true },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 2. Jika customer mendaftar lewat Google dan tidak memiliki password manual
    if (!customer.password) {
      return NextResponse.json(
        { message: "password belum di set" },
        { status: 400 }
      );
    }

    // 3. Verifikasi password
    const passwordMatch = await bcrypt.compare(password, customer.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 4. Buat session cookie (untuk Web client)
    await createSession(customer.id, customer.name, "CUSTOMER");

    // 5. Generate JWT token (untuk Mobile/Flutter client)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari
    const token = await encrypt({
      userId: customer.id,
      username: customer.name,
      role: "CUSTOMER",
      expiresAt,
    });

    return NextResponse.json({
      message: "Login berhasil",
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: "CUSTOMER",
        addresses: customer.addresses,
      },
      token: token,
    });
  } catch (error) {
    console.error("Customer login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

// GET /api/auth/customer/login — Ambil session customer aktif
export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role.toUpperCase() !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Belum login atau session tidak valid sebagai Customer", data: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      data: {
        customerId: session.userId,
        name: session.username,
        role: session.role,
      },
    });
  } catch (error) {
    console.error("Get customer session error:", error);
    return NextResponse.json(
      { message: "Session tidak valid", data: null },
      { status: 401 }
    );
  }
}

// DELETE /api/auth/customer/login — Logout Customer
export async function DELETE() {
  try {
    await deleteSession();
    return NextResponse.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Customer logout error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}