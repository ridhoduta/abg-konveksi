import { NextResponse } from "next/server";
import { categoryService } from "@/app/service/productService";

export async function GET() {
  try {
    const categories = await categoryService.getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const category = await categoryService.createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}