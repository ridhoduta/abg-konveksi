import { NextResponse } from "next/server";
import { sizeService } from "@/app/service/productService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid size ID" }, { status: 400 });
    }

    const size = await sizeService.getSizeById(id);
    if (!size) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    return NextResponse.json(size);
  } catch (error) {
    console.error("Failed to fetch size:", error);
    return NextResponse.json({ error: "Failed to fetch size" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid size ID" }, { status: 400 });
    }

    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Size name is required" }, { status: 400 });
    }

    const size = await sizeService.updateSize(id, body);
    return NextResponse.json(size);
  } catch (error) {
    console.error("Failed to update size:", error);
    return NextResponse.json({ error: "Failed to update size" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid size ID" }, { status: 400 });
    }

    await sizeService.deleteSize(id);
    return NextResponse.json({ message: "Size deleted successfully" });
  } catch (error) {
    console.error("Failed to delete size:", error);
    return NextResponse.json({ error: "Failed to delete size" }, { status: 500 });
  }
}