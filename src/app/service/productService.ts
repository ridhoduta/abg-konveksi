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
        images: {
          orderBy: { order: "asc" },
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
        images: {
          orderBy: { order: "asc" },
        },
      },
    });
  },

  async createProduct(data: {
    name: string;
    description?: string;
    categoryId: number;
    images?: { url: string; isPrimary?: boolean; order?: number }[];
    variants?: { sizeId: number; price: number; description?: string; stock: number }[];
  }) {
    const { variants, images, ...productData } = data;

    return await prisma.product.create({
      data: {
        ...productData,
        images:
          images && images.length > 0
            ? {
                create: images.map((img, index) => ({
                  url: img.url,
                  isPrimary: img.isPrimary ?? index === 0,
                  order: img.order ?? index,
                })),
              }
            : undefined,
        variants:
          variants && variants.length > 0
            ? {
                create: variants.map((v) => ({
                  sizeId: v.sizeId,
                  price: v.price,
                  description: v.description,
                  stock: v.stock,
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
        images: {
          orderBy: { order: "asc" },
        },
      },
    });
  },

  async updateProduct(
    id: number,
    data: {
      name?: string;
      description?: string;
      categoryId?: number;
      images?: { url: string; isPrimary?: boolean; order?: number }[];
      variants?: { sizeId: number; price: number; description?: string; stock: number }[];
    }
  ) {
    const { variants, images, ...productData } = data;

    return await prisma.$transaction(async (tx: any) => {
      // Handle images update
      if (images) {
        // Delete all existing images for this product
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        // Create new images
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img, index) => ({
              productId: id,
              url: img.url,
              isPrimary: img.isPrimary ?? index === 0,
              order: img.order ?? index,
            })),
          });
        }
      }

      // If variants are provided, we'll update them safely using merge/upsert.
      if (variants) {
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
              description: v.description,
              stock: v.stock,
            },
            create: {
              productId: id,
              sizeId: v.sizeId,
              price: v.price,
              description: v.description,
              stock: v.stock,
            },
          });
        }
      }

      // Finally, update the product fields
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
          images: {
            orderBy: { order: "asc" },
          },
        },
      });
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