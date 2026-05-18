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

    // If variants are provided, we'll replace the existing variants with the new ones.
    if (variants) {
      return await prisma.$transaction(async (tx:any) => {
        // Delete all existing variants
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        // Update product and create new variants
        return await tx.product.update({
          where: { id },
          data: {
            ...productData,
            variants: {
              create: variants.map((v) => ({
                sizeId: v.sizeId,
                price: v.price,
              })),
            },
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
    return await prisma.product.delete({
      where: { id },
    });
  },
};