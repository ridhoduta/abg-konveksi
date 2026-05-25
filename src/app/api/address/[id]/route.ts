import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * PUT /api/address/[id]
 * Update a specific address.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role.toUpperCase() !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Akses ditolak. Anda harus login sebagai Customer." },
        { status: 401 }
      );
    }

    const addressId = Number(params.id);
    if (isNaN(addressId)) {
      return NextResponse.json({ message: "ID alamat tidak valid." }, { status: 400 });
    }

    // Periksa apakah alamat ada dan milik customer yang sedang login
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) {
      return NextResponse.json({ message: "Alamat tidak ditemukan." }, { status: 404 });
    }

    if (existingAddress.customerId !== session.userId) {
      return NextResponse.json(
        { message: "Anda tidak memiliki akses untuk mengubah alamat ini." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { label, address, latitude, longitude, isDefault } = body;

    const dataToUpdate: any = {};
    if (label !== undefined) dataToUpdate.label = label;
    if (address !== undefined) dataToUpdate.address = address;
    if (latitude !== undefined) dataToUpdate.latitude = Number(latitude);
    if (longitude !== undefined) dataToUpdate.longitude = Number(longitude);

    // Menangani logika isDefault
    if (isDefault !== undefined) {
      const isSettingDefault = isDefault === true || isDefault === "true";
      dataToUpdate.isDefault = isSettingDefault;

      if (isSettingDefault && !existingAddress.isDefault) {
        // Jika mengubah alamat menjadi default, matikan default di alamat lain
        await prisma.address.updateMany({
          where: { 
            customerId: session.userId,
            id: { not: addressId }
          },
          data: { isDefault: false },
        });
      } else if (!isSettingDefault && existingAddress.isDefault) {
         // Opsional: mencegah penghapusan default jika ini satu-satunya alamat, tapi biarkan saja sementara
      }
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      message: "Alamat berhasil diperbarui.",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Update Address Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/address/[id]
 * Delete a specific address.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role.toUpperCase() !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Akses ditolak. Anda harus login sebagai Customer." },
        { status: 401 }
      );
    }

    const addressId = Number(params.id);
    if (isNaN(addressId)) {
      return NextResponse.json({ message: "ID alamat tidak valid." }, { status: 400 });
    }

    // Periksa apakah alamat ada dan milik customer yang sedang login
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) {
      return NextResponse.json({ message: "Alamat tidak ditemukan." }, { status: 404 });
    }

    if (existingAddress.customerId !== session.userId) {
      return NextResponse.json(
        { message: "Anda tidak memiliki akses untuk menghapus alamat ini." },
        { status: 403 }
      );
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    // Jika alamat yang dihapus adalah default, jadikan alamat pertama lainnya sebagai default (opsional)
    if (existingAddress.isDefault) {
      const remainingAddress = await prisma.address.findFirst({
        where: { customerId: session.userId },
        orderBy: { createdAt: 'desc' }
      });

      if (remainingAddress) {
        await prisma.address.update({
          where: { id: remainingAddress.id },
          data: { isDefault: true }
        });
      }
    }

    return NextResponse.json({
      message: "Alamat berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
