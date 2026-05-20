import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, createSession, encrypt } from "@/lib/session";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/customer
 * Registers a new Customer in the system and logs them in automatically.
 * Accessible by anyone (public registration) or by ADMIN/KASIR to manually register customers.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { googleId, email, name, avatar, phone, addresses, password } = body;

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

    // Jika mendaftar non-Google, pastikan password diisi
    if (!googleId && !password) {
      return NextResponse.json(
        { message: "Password wajib diisi untuk registrasi non-Google" },
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
    const hashPassword = password ? await bcrypt.hash(password, 10) : null;

    // 4. Buat Customer Baru
    const newCustomer = await prisma.customer.create({
      data: {
        googleId: finalGoogleId,
        email,
        name,
        avatar: avatar || null,
        password: hashPassword || null,
        phone: phone || null,
        addresses: addressCreateData,
      },
      include: {
        addresses: true,
      },
    });

    // 5. Buat session cookie (untuk Web client)
    await createSession(newCustomer.id, newCustomer.name, "CUSTOMER");

    // 6. Generate JWT token (untuk Mobile/Flutter client)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari
    const token = await encrypt({
      userId: newCustomer.id,
      username: newCustomer.name,
      role: "CUSTOMER",
      expiresAt,
    });

    return NextResponse.json(
      {
        message: "Customer berhasil diregistrasikan",
        data: newCustomer,
        token: token,
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
 * GET /api/auth/customer
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

/**
 * PUT /api/auth/customer
 * Updates the active customer's password.
 * Accessible only by logged-in CUSTOMER.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role.toUpperCase() !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Akses ditolak. Hanya Customer terautentikasi yang dapat mengubah password." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { message: "Password baru wajib diisi dan minimal 6 karakter." },
        { status: 400 }
      );
    }

    // Ambil data customer dari database
    const customer = await prisma.customer.findUnique({
      where: { id: session.userId },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer tidak ditemukan." },
        { status: 404 }
      );
    }

    // Jika customer sudah memiliki password (registrasi manual), wajib memverifikasi password lama
    if (customer.password) {
      if (!oldPassword) {
        return NextResponse.json(
          { message: "Password lama wajib diisi." },
          { status: 400 }
        );
      }

      const isOldPasswordMatch = await bcrypt.compare(oldPassword, customer.password);
      if (!isOldPasswordMatch) {
        return NextResponse.json(
          { message: "Password lama salah." },
          { status: 401 }
        );
      }
    }

    // Hash password baru dan update ke database
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.customer.update({
      where: { id: session.userId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({
      message: "Password berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Update Customer Password Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}


