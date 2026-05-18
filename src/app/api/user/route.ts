import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST /api/user — Create a kasir or admin account
export async function POST(request: NextRequest) {
  try {
    // Only admins can create accounts
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return Response.json(
        { message: "Akses ditolak. Hanya admin yang bisa membuat akun." },
        { status: 403 }
      );
    }

    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return Response.json(
        { message: "Username, password, dan role wajib diisi" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "KASIR"].includes(role.toUpperCase())) {
      return Response.json(
        { message: "Role harus ADMIN atau KASIR" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return Response.json(
        { message: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    // Find or create the role
    const roleRecord = await prisma.role.upsert({
      where: { name: role.toUpperCase() },
      update: {},
      create: { name: role.toUpperCase() },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        roleId: roleRecord.id,
      },
      include: { role: true },
    });

    return Response.json(
      {
        message: "Akun berhasil dibuat",
        data: {
          id: user.id,
          username: user.username,
          role: user.role.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return Response.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// GET /api/user — List all users (admin only)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return Response.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({
      data: users.map((u:any) => ({
        id: u.id,
        username: u.username,
        role: u.role.name,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get users error:", error);
    return Response.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}