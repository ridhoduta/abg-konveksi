
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  const kasirRole = await prisma.role.upsert({
    where: { name: "KASIR" },
    update: {},
    create: { name: "KASIR" },
  });


  const hashedPassword = await bcrypt.hash("admin123", 10);
  const kasirHashPassword = await bcrypt.hash("kasir123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  const kasir = await prisma.user.upsert({
    where: { username: "kasir" },
    update: {},
    create: {
      username: "kasir",
      password: kasirHashPassword,
      roleId: kasirRole.id,
    },
  });

  // --- Seed Categories ---
  const categoriesData = ["Kaos", "Kemeja", "Jaket", "Almamater"];
  const categories: { [key: string]: any } = {};
  for (const catName of categoriesData) {
    categories[catName] = await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }

  // --- Seed Sizes ---
  const sizesData = ["S", "M", "L", "XL", "XXL"];
  const sizes: { [key: string]: any } = {};
  for (const sizeName of sizesData) {
    sizes[sizeName] = await prisma.size.upsert({
      where: { name: sizeName },
      update: {},
      create: { name: sizeName },
    });
  }

  // --- Seed Products & Variants ---
  const productsToSeed = [
  {
    name: "Kaos Polos Cotton Combed 30s",
    description: "Kaos polos berkualitas tinggi berbahan 100% Cotton Combed 30s. Sangat nyaman, adem, dan cocok untuk sablon manual maupun digital.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
    categoryName: "Kaos",
    prices: {
      S: 45000,
      M: 47000,
      L: 50000,
      XL: 53000,
      XXL: 56000,
    },
  },
  {
    name: "Kemeja PDL Lapangan Dril",
    description: "Kemeja PDL (Pakaian Dinas Lapangan) lengan panjang bahan American Drill. Kuat, rapi, dengan ventilasi jala di punggung untuk sirkulasi udara.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
    categoryName: "Kemeja",
    prices: {
      S: 110000,
      M: 115000,
      L: 120000,
      XL: 125000,
      XXL: 130000,
    },
  },
  {
    name: "Jaket Hoodie Fleece",
    description: "Hoodie pullover klasik dengan bahan Cotton Fleece tebal dan hangat. Dilengkapi saku kanguru dan tali serut pada penutup kepala.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
    categoryName: "Jaket",
    prices: {
      S: 125000,
      M: 130000,
      L: 135000,
      XL: 140000,
      XXL: 145000,
    },
  },
  {
    name: "Jas Almamater Kampus",
    description: "Jas almamater standard universitas/sekolah. Menggunakan bahan High Twist berkualitas, lengkap dengan furing dalam dan kancing logam custom.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop",
    categoryName: "Almamater",
    prices: {
      S: 135000,
      M: 140000,
      L: 145000,
      XL: 150000,
      XXL: 155000,
    },
  },
  // --- TAMBAHAN PRODUK BARU ---
  {
    name: "Polo Shirt Pique Premium",
    description: "Kaos polo berkerah dengan bahan Cotton Pique premium. Tekstur berpori khas polo shirt, menyerap keringat dengan baik, dan memberikan kesan semi-formal.",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600&auto=format&fit=crop",
    categoryName: "Kaos",
    prices: {
      S: 65000,
      M: 67000,
      L: 70000,
      XL: 75000,
      XXL: 80000,
    },
  },
  {
    name: "Kemeja Flanel Kotak-Kotak",
    description: "Kemeja kasual bahan flanel wol lembut berkualitas tinggi. Motif kotak-kotak klasik yang timeless, cocok untuk dipakai sebagai kemeja utama atau outer.",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop",
    categoryName: "Kemeja",
    prices: {
      S: 95000,
      M: 100000,
      L: 105000,
      XL: 110000,
      XXL: 115000,
    },
  },
  {
    name: "Jaket Bomber Taslan Waterproof",
    description: "Jaket bomber stylish menggunakan bahan Taslan JN yang semi-waterproof dan windproof. Bagian dalam dilapisi furing dacron tebal, cocok untuk berkendara.",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop",
    categoryName: "Jaket",
    prices: {
      S: 140000,
      M: 145000,
      L: 150000,
      XL: 155000,
      XXL: 165000,
    },
  },
  {
    name: "Sweater Crewneck Cotton",
    description: "Sweater model crewneck minimalis tanpa tudung kepala. Terbuat dari bahan katun baby terry yang lembut, ringan, namun tetap hangat saat cuaca dingin.",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
    categoryName: "Jaket",
    prices: {
      S: 85000,
      M: 90000,
      L: 95000,
      XL: 100000,
      XXL: 105000,
    },
  },
  {
    name: "Rompi Safety Drill Lapangan",
    description: "Rompi proyek/lapangan dengan bahan Drill kokoh. Dilengkapi dengan pita reflektor (scotlight) yang menyala dalam gelap demi keamanan kerja.",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop",
    categoryName: "Rompi",
    prices: {
      S: 75000,
      M: 78000,
      L: 82000,
      XL: 87000,
      XXL: 92000,
    },
  },
  {
    name: "Jersey Olahraga Dryfit",
    description: "Jersey olahraga menggunakan bahan Dryfit Benzema yang memiliki sirkulasi udara maksimal, sangat cepat kering, dan sangat elastis untuk pergerakan aktif.",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop",
    categoryName: "Kaos",
    prices: {
      S: 55000,
      M: 57000,
      L: 60000,
      XL: 65000,
      XXL: 70000,
    },
  },
];

  for (const item of productsToSeed) {
    const category = categories[item.categoryName];
    if (!category) continue;

    // Check if product already exists by name
    let product = await prisma.product.findFirst({
      where: { name: item.name },
    });

    if (product) {
      // Update existing product details
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          description: item.description,
          image: item.image,
          categoryId: category.id,
        },
      });
    } else {
      // Create new product
      product = await prisma.product.create({
        data: {
          name: item.name,
          description: item.description,
          image: item.image,
          categoryId: category.id,
        },
      });
    }

    // Seed/update variants for this product
    for (const [sizeName, price] of Object.entries(item.prices)) {
      const sizeObj = sizes[sizeName];
      if (!sizeObj) continue;

      await prisma.productVariant.upsert({
        where: {
          productId_sizeId: {
            productId: product.id,
            sizeId: sizeObj.id,
          },
        },
        update: {
          price: price,
        },
        create: {
          productId: product.id,
          sizeId: sizeObj.id,
          price: price,
        },
      });
    }
  }

  // --- Seed Customers & Addresses & FCM Tokens ---
  const customersData = [
    {
      googleId: "google-oauth-budi-123",
      email: "budi.santoso@gmail.com",
      name: "Budi Santoso",
      phone: "081234567890",
      avatar: null,
      address: {
        label: "Rumah Utama",
        address: "Jl. Merdeka No. 17, Jakarta Pusat",
        latitude: -6.17511,
        longitude: 106.865039,
        isDefault: true,
      },
      fcmToken: "dummy-fcm-token-budi-12345",
    },
    {
      googleId: "google-oauth-siti-456",
      email: "siti.rahma@gmail.com",
      name: "Siti Rahma",
      phone: "089876543210",
      avatar: null,
      address: {
        label: "Kantor",
        address: "Sudirman Central Business District Lot 18, Jakarta Selatan",
        latitude: -6.2243,
        longitude: 106.8098,
        isDefault: true,
      },
      fcmToken: null,
    },
  ];

  const seededCustomers: any[] = [];
  const seededAddresses: { [email: string]: any } = {};

  for (const cData of customersData) {
    const customer = await prisma.customer.upsert({
      where: { email: cData.email },
      update: {
        name: cData.name,
        phone: cData.phone,
        googleId: cData.googleId,
      },
      create: {
        email: cData.email,
        name: cData.name,
        phone: cData.phone,
        googleId: cData.googleId,
        avatar: cData.avatar,
      },
    });
    seededCustomers.push(customer);

    // Address
    const address = await prisma.address.findFirst({
      where: {
        customerId: customer.id,
        label: cData.address.label,
      },
    });

    if (address) {
      seededAddresses[cData.email] = await prisma.address.update({
        where: { id: address.id },
        data: {
          address: cData.address.address,
          latitude: cData.address.latitude,
          longitude: cData.address.longitude,
          isDefault: cData.address.isDefault,
        },
      });
    } else {
      seededAddresses[cData.email] = await prisma.address.create({
        data: {
          customerId: customer.id,
          label: cData.address.label,
          address: cData.address.address,
          latitude: cData.address.latitude,
          longitude: cData.address.longitude,
          isDefault: cData.address.isDefault,
        },
      });
    }

    // FCM Token
    if (cData.fcmToken) {
      await prisma.fcmToken.upsert({
        where: { token: cData.fcmToken },
        update: { customerId: customer.id },
        create: {
          token: cData.fcmToken,
          customerId: customer.id,
        },
      });
    }
  }

  // --- Seed Orders & OrderItems & OrderPayments ---
  const kaosProduct = await prisma.product.findFirst({
    where: { name: "Kaos Polos Cotton Combed 30s" },
  });
  const jaketProduct = await prisma.product.findFirst({
    where: { name: "Jaket Hoodie Fleece" },
  });
  const kemejaProduct = await prisma.product.findFirst({
    where: { name: "Kemeja PDL Lapangan Dril" },
  });

  const sizeL = await prisma.size.findUnique({ where: { name: "L" } });
  const sizeXL = await prisma.size.findUnique({ where: { name: "XL" } });
  const sizeM = await prisma.size.findUnique({ where: { name: "M" } });

  if (kaosProduct && jaketProduct && kemejaProduct && sizeL && sizeXL && sizeM) {
    const kaosVariantL = await prisma.productVariant.findUnique({
      where: { productId_sizeId: { productId: kaosProduct.id, sizeId: sizeL.id } },
    });
    const jaketVariantXL = await prisma.productVariant.findUnique({
      where: { productId_sizeId: { productId: jaketProduct.id, sizeId: sizeXL.id } },
    });
    const kemejaVariantM = await prisma.productVariant.findUnique({
      where: { productId_sizeId: { productId: kemejaProduct.id, sizeId: sizeM.id } },
    });

    if (kaosVariantL && jaketVariantXL && kemejaVariantM) {
      // Order 1 (Budi)
      const budi = seededCustomers.find((c) => c.email === "budi.santoso@gmail.com");
      const budiAddr = seededAddresses["budi.santoso@gmail.com"];

      if (budi && budiAddr) {
        const existingOrder = await prisma.order.findFirst({
          where: {
            customerId: budi.id,
            total: 330000,
          },
        });

        if (!existingOrder) {
          await prisma.order.create({
            data: {
              customerId: budi.id,
              addressId: budiAddr.id,
              status: "SHIPPED",
              paymentStatus: "PAID",
              total: 330000,
              note: "Mohon dikirim sore hari.",
              items: {
                create: [
                  {
                    variantId: kaosVariantL.id,
                    quantity: 1,
                    price: kaosVariantL.price,
                  },
                  {
                    variantId: jaketVariantXL.id,
                    quantity: 2,
                    price: jaketVariantXL.price,
                  },
                ],
              },
              payment: {
                create: {
                  amount: 330000,
                  method: "TRANSFER",
                  status: "VERIFIED",
                  proofOfPayment: "https://mbrkbchiatulahyxoroa.supabase.co/storage/v1/object/public/proof/payment_proof_budi.jpg",
                  reference: "TRX-82736412",
                  paidAt: new Date(),
                  note: "Pembayaran lunas via transfer Mandiri",
                },
              },
            },
          });
        }
      }

      // Order 2 (Siti)
      const siti = seededCustomers.find((c) => c.email === "siti.rahma@gmail.com");
      const sitiAddr = seededAddresses["siti.rahma@gmail.com"];

      if (siti && sitiAddr) {
        const existingOrder = await prisma.order.findFirst({
          where: {
            customerId: siti.id,
            total: 575000,
          },
        });

        if (!existingOrder) {
          await prisma.order.create({
            data: {
              customerId: siti.id,
              addressId: sitiAddr.id,
              status: "PENDING",
              paymentStatus: "UNPAID",
              total: 575000,
              note: "Bayar di tempat (COD)",
              items: {
                create: [
                  {
                    variantId: kemejaVariantM.id,
                    quantity: 5,
                    price: kemejaVariantM.price,
                  },
                ],
              },
              payment: {
                create: {
                  amount: 575000,
                  method: "COD",
                  status: "PENDING",
                  note: "Menunggu kurir mengantar barang dan menerima pembayaran",
                },
              },
            },
          });
        }
      }
    }
  }

  console.log("Seed successful!");
  console.log("Admin user created: admin / admin123");
  console.log("Kasir user created: kasir / kasir123");
  console.log("Categories and Sizes seeded successfully!");
  console.log("Products and Variants seeded successfully!");
  console.log("Customers, Addresses, and FCM Tokens seeded successfully!");
  console.log("Orders, OrderItems, and OrderPayments seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
