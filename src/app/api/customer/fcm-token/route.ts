import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role.toUpperCase() !== "CUSTOMER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    // Upsert to handle existing tokens (e.g. updating user association on the same device)
    const fcmToken = await prisma.fcmToken.upsert({
      where: { token: token },
      update: { customerId: session.userId },
      create: {
        token: token,
        customerId: session.userId,
      },
    });

    return NextResponse.json({ message: "FCM token saved successfully", data: fcmToken });
  } catch (error) {
    console.error("Save FCM Token Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
