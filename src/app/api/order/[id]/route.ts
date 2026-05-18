import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(params.id) },
      include: {
        customer: true,
        address: true,
        createdBy: { select: { id: true, username: true } },
        items: {
          include: {
            variant: {
              include: { product: true, size: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("Get Order Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, note } = body;

    const order = await prisma.order.update({
      where: { id: Number(params.id) },
      data: {
        ...(status && { status }),
        ...(note !== undefined && { note })
      }
    });

    return NextResponse.json({ message: "Order updated successfully", data: order });
  } catch (error) {
    console.error("Update Order Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getSession();
    if (!session || !["ADMIN", "KASIR"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.order.delete({
      where: { id: Number(params.id) }
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}