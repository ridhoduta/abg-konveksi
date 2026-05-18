import { NextResponse } from "next/server";
import { sizeService } from "@/app/service/productService";

export async function GET() {
  try {
    const sizes = await sizeService.getAllSizes();
    return NextResponse.json(sizes);
  } catch (error) {
    console.error("Failed to fetch sizes:", error);
    return NextResponse.json({ error: "Failed to fetch sizes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Size name is required" }, { status: 400 });
    }

    const size = await sizeService.createSize(body);
    return NextResponse.json(size, { status: 201 });
  } catch (error) {
    console.error("Failed to create size:", error);
    return NextResponse.json({ error: "Failed to create size" }, { status: 500 });
  }
}