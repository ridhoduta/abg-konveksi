import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/session"; // We use encrypt to return the JWT to the Flutter app

// Gunakan Client ID dari Google Developer Console Anda (bisa ditaruh di .env nantinya)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { message: "idToken wajib dikirimkan" },
        { status: 400 }
      );
    }

    // 1. Verifikasi Token Google
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      // audience: process.env.GOOGLE_CLIENT_ID, // Jika ingin lebih aman, spesifikkan audience
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { message: "Token Google tidak valid" },
        { status: 401 }
      );
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!googleId || !email || !name) {
      return NextResponse.json(
        { message: "Data dari Google tidak lengkap" },
        { status: 400 }
      );
    }

    // 2. Cek apakah user (Customer) sudah ada
    let customer = await prisma.customer.findUnique({
      where: { googleId: googleId },
    });

    // 3. Jika belum ada, buat user (Customer) baru
    if (!customer) {
      // Periksa juga berdasarkan email untuk menghindari duplikat email jika login dengan metode lain
      const existingEmail = await prisma.customer.findUnique({
        where: { email: email },
      });

      if (existingEmail) {
        // Gabungkan/hubungkan akun google ke akun email yang sudah ada
        customer = await prisma.customer.update({
          where: { email: email },
          data: { googleId: googleId, avatar: picture },
        });
      } else {
        // Buat Customer baru
        customer = await prisma.customer.create({
          data: {
            googleId: googleId,
            email: email,
            name: name,
            avatar: picture,
          },
        });
      }
    }

    // 4. Generate JWT menggunakan fungsi encrypt (Sama seperti Session Payload)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari
    const token = await encrypt({
      userId: customer.id,
      username: customer.name,
      role: "CUSTOMER", // Secara eksplisit kita beri role CUSTOMER
      expiresAt,
    });

    // 5. Kembalikan data dan token
    return NextResponse.json({
      message: "Login berhasil",
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: "CUSTOMER",
      },
      token: token, // Flutter App akan menyimpan token ini (misal di SharedPreferences)
    }, { status: 200 });

  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json(
      { message: "Gagal memverifikasi token Google" },
      { status: 500 }
    );
  }
}
