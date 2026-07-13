
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
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=600&auto=format&fit=crop"
      ],
      categoryName: "Kaos",
      stock: 100,
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
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop"
      ],
      categoryName: "Kemeja",
      stock: 50,
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
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a55?q=80&w=600&auto=format&fit=crop"
      ],
      categoryName: "Jaket",
      stock: 30,
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
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=600&auto=format&fit=crop"
      ],
      categoryName: "Almamater",
      stock: 25,
      prices: {
        S: 135000,
        M: 140000,
        L: 145000,
        XL: 150000,
        XXL: 155000,
      },
    },
    {
      name: "Polo Shirt Pique Premium",
      description: "Kaos polo berkerah dengan bahan Cotton Pique premium. Tekstur berpori khas polo shirt, menyerap keringat dengan baik, dan memberikan kesan semi-formal.",
      images: [
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop"
      ],
      categoryName: "Kaos",
      stock: 75,
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
      images: [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?q=80&w=600&auto=format&fit=crop"
      ],
      categoryName: "Kemeja",
      stock: 60,
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
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=600&auto=format&fit=crop"
      ],
      categoryName: "Jaket",
      stock: 40,
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
      images: [
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop"
      ],
      categoryName: "Jaket",
      stock: 55,
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
      images: [
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590133325985-2c64da24b0be?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516715094727-ec48be335d79?q=80&w=600&auto=format&fit=crop"
      ],
      categoryName: "Rompi",
      stock: 80,
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
      images: [
        "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop"
      ],
      categoryName: "Kaos",
      stock: 90,
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
          categoryId: category.id,
          stock: item.stock,
        },
      });

      // Delete existing images and recreate
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });

      // Create new images
      for (let i = 0; i < item.images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: item.images[i],
            isPrimary: i === 0,
            order: i,
          },
        });
      }
    } else {
      // Create new product
      product = await prisma.product.create({
        data: {
          name: item.name,
          description: item.description,
          categoryId: category.id,
          stock: item.stock,
          images: {
            create: item.images.map((url, index) => ({
              url,
              isPrimary: index === 0,
              order: index,
            })),
          },
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
