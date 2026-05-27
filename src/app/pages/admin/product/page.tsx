"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProduct } from "../../hooks/useProduct";
import { ProductTable } from "../../component/productTable";
import { Plus, Filter, Download } from "lucide-react";

export default function ProductListPage() {
  const router = useRouter();
  const { products, loading, error, fetchProducts, deleteProduct } = useProduct();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  return (
    <main className="flex-1 p-xl overflow-y-auto ml-72">
        <header className="flex justify-between items-center mb-xl bg-surface-container-lowest p-lg border border-outline-variant rounded-sm shadow-sm">
          <div className="flex items-center gap-8">
            <h2 className="headline-md font-bold text-on-surface">Factory Management</h2>
          </div>
          <button
            onClick={() => router.push("/pages/admin/product/new")}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Product
          </button>
        </header>

        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <section className="bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant overflow-hidden">
          <div className="p-lg flex justify-between items-center bg-surface-container-low/50 border-b border-outline-variant">
            <h3 className="headline-md text-on-surface">Product Inventory</h3>
          </div>
          
          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="spinner !border-primary !border-t-transparent w-8 h-8 rounded-full border-4"></div>
            </div>
          ) : (
            <ProductTable products={products} onDelete={handleDelete} />
          )}
        </section>
      </main>
  );
}