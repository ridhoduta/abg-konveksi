import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, getSession } from "@/lib/session";

// POST /api/auth — Login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      return Response.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return Response.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    await createSession(user.id, user.username, user.role.name);

    return Response.json({
      message: "Login berhasil",
      data: {
        id: user.id,
        username: user.username,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// GET /api/auth — Get current session
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return Response.json({ message: "Belum login" }, { status: 401 });
    }

    return Response.json({
      data: {
        userId: session.userId,
        username: session.username,
        role: session.role,
      },
    });
  } catch {
    return Response.json({ message: "Session tidak valid" }, { status: 401 });
  }
}

// DELETE /api/auth — Logout
export async function DELETE() {
  try {
    await deleteSession();
    return Response.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}