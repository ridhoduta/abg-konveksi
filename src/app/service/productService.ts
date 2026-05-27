import { prisma } from "@/lib/prisma";

export const categoryService = {
  async getAllCategories() {
    return await prisma.category.findMany({
      orderBy: { id: "asc" },
    });
  },

  async getCategoryById(id: number) {
    return await prisma.category.findUnique({
      where: { id },
    });
  },

  async createCategory(data: { name: string }) {
    return await prisma.category.create({
      data,
    });
  },

  async updateCategory(id: number, data: { name: string }) {
    return await prisma.category.update({
      where: { id },
      data,
    });
  },

  async deleteCategory(id: number) {
    return await prisma.category.delete({
      where: { id },
    });
  },
};

export const sizeService = {
  async getAllSizes() {
    return await prisma.size.findMany({
      orderBy: { id: "asc" },
    });
  },

  async getSizeById(id: number) {
    return await prisma.size.findUnique({
      where: { id },
    });
  },

  async createSize(data: { name: string }) {
    return await prisma.size.create({
      data,
    });
  },

  async updateSize(id: number, data: { name: string }) {
    return await prisma.size.update({
      where: { id },
      data,
    });
  },

  async deleteSize(id: number) {
    return await prisma.size.delete({
      where: { id },
    });
  },
};

export const productService = {
  async getAllProducts() {
    return await prisma.product.findMany({
      include: {
        category: true,
        variants: {
          include: {
            size: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProductById(id: number) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          include: {
            size: true,
          },
        },
      },
    });
  },

  async createProduct(data: {
    name: string;
    description?: string;
    image?: string;
    categoryId: number;
    variants?: { sizeId: number; price: number }[];
  }) {
    const { variants, ...productData } = data;

    return await prisma.product.create({
      data: {
        ...productData,
        variants:
          variants && variants.length > 0
            ? {
                create: variants.map((v) => ({
                  sizeId: v.sizeId,
                  price: v.price,
                })),
              }
            : undefined,
      },
      include: {
        category: true,
        variants: {
          include: {
            size: true,
          },
        },
      },
    });
  },

  async updateProduct(
    id: number,
    data: {
      name?: string;
      description?: string;
      image?: string;
      categoryId?: number;
      variants?: { sizeId: number; price: number }[];
    }
  ) {
    const { variants, ...productData } = data;

    // If variants are provided, we'll update them safely using merge/upsert.
    if (variants) {
      return await prisma.$transaction(async (tx: any) => {
        // 1. Get all current variants for the product
        const currentVariants = await tx.productVariant.findMany({
          where: { productId: id },
          include: { size: true },
        });

        const incomingSizeIds = variants.map((v) => v.sizeId);

        // 2. Identify variants to delete (those in current but not in incoming)
        const variantsToDelete = currentVariants.filter(
          (cv:any) => !incomingSizeIds.includes(cv.sizeId)
        );

        // Delete the ones that need to be deleted, checking if referenced in OrderItem
        for (const v of variantsToDelete) {
          const orderItemCount = await tx.orderItem.count({
            where: { variantId: v.id },
          });
          if (orderItemCount > 0) {
            throw new Error(`Ukuran ${v.size?.name || ""} tidak dapat dihapus karena sudah memiliki riwayat pemesanan/transaksi.`);
          }
          await tx.productVariant.delete({
            where: { id: v.id },
          });
        }

        // 3. Upsert the incoming variants
        for (const v of variants) {
          await tx.productVariant.upsert({
            where: {
              productId_sizeId: {
                productId: id,
                sizeId: v.sizeId,
              },
            },
            update: {
              price: v.price,
            },
            create: {
              productId: id,
              sizeId: v.sizeId,
              price: v.price,
            },
          });
        }

        // 4. Finally, update the product fields
        return await tx.product.update({
          where: { id },
          data: productData,
          include: {
            category: true,
            variants: {
              include: {
                size: true,
              },
            },
          },
        });
      });
    }

    return await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
        variants: {
          include: {
            size: true,
          },
        },
      },
    });
  },

  async deleteProduct(id: number) {
    // Check if any variant of this product is referenced in OrderItem
    const orderItemsCount = await prisma.orderItem.count({
      where: {
        variant: {
          productId: id,
        },
      },
    });

    if (orderItemsCount > 0) {
      throw new Error("Produk tidak dapat dihapus karena sudah memiliki riwayat transaksi/pesanan.");
    }

    return await prisma.product.delete({
      where: { id },
    });
  },
};