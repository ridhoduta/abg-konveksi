import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // 🧠 validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET!)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { success: false, message: "Gagal upload file" },
        { status: 500 }
      );
    }

    const { data } = supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET!)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Upload error" },
      { status: 500 }
    );
  }
}
