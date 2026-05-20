"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, AuthUser } from "@/app/service/authService";
import { useProduct } from "@/app/pages/hooks/useProduct";
import { ProductTableKasir } from "@/app/pages/component/productTableKasir";
import { Plus, Filter, Download, Bell, HelpCircle } from "lucide-react";

export default function ProductListPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const { products, loading, error, fetchProducts, deleteProduct } = useProduct();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await authService.getMe();
      if (res.success && res.data && res.data.role === "KASIR") {
        setUser(res.data);
      } else {
        router.push("/pages/login");
      }
      setLoadingUser(false);
    };
    checkAuth();
    fetchProducts();
  }, [router, fetchProducts]);

  const handleLogout = async () => {
    await authService.logout();
    router.push("/pages/login");
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="spinner !border-primary !border-t-transparent w-8 h-8 rounded-full border-4"></div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <main
        className="
    ml-72
    pt-16
    min-h-screen
    bg-slate-50
    p-4
    md:p-6
    lg:p-8
  "
      >
        <section className="mb-6">
          <div
            className="
      flex flex-col sm:flex-row
      sm:items-center
      sm:justify-between
      gap-4
      bg-white
      border border-outline-variant
      rounded-2xl
      p-5 md:p-6
      shadow-sm
    "
          >
            <div>
              <h2 className="text-2xl font-bold text-on-surface">
                Product Inventory
              </h2>

              <p className="text-sm text-on-surface-variant mt-1">
                Manage and organize your products
              </p>
            </div>

            <button
              onClick={() => router.push("/pages/kasir/product/new")}
              className="
        h-12
        px-5
        rounded-xl
        bg-primary
        text-white
        font-semibold
        flex items-center justify-center gap-2
        hover:opacity-90
        active:scale-[0.98]
        transition-all
        shadow-md
        whitespace-nowrap
      "
            >
              <Plus className="w-5 h-5" />
              New Product
            </button>
          </div>
        </section>

        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden flex-1 flex flex-col">
          <div className="p-6 flex justify-between items-center bg-slate-50/50 border-b border-outline-variant">
            <h3 className="text-lg font-semibold text-on-surface">All Products</h3>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                <Filter className="w-4 h-4" /> Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-10 flex justify-center flex-1">
              <div className="spinner !border-primary !border-t-transparent w-8 h-8 rounded-full border-4"></div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <ProductTableKasir products={products} onDelete={deleteProduct} />
            </div>
          )}
        </section>
      </main>
    </>
  );
}