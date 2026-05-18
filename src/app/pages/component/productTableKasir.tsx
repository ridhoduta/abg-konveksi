import React from "react";
import { Product } from "../hooks/useProduct";
import { useRouter } from "next/navigation";
import { Image, Pencil, Trash2 } from "lucide-react";

export function ProductTableKasir({ products, onDelete }: { products: Product[], onDelete: (id: number) => void }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low text-on-surface-variant">
            <th className="px-6 py-4 font-label-sm text-label-sm">ID</th>
            <th className="px-6 py-4 font-label-sm text-label-sm">Image</th>
            <th className="px-6 py-4 font-label-sm text-label-sm">Product Name</th>
            <th className="px-6 py-4 font-label-sm text-label-sm">Description</th>
            <th className="px-6 py-4 font-label-sm text-label-sm">Variants</th>
            <th className="px-6 py-4 font-label-sm text-label-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-primary/5 transition-colors group">
              <td className="px-6 py-4 font-body-sm text-on-surface-variant">#GP-{product.id.toString().padStart(4, '0')}</td>
              <td className="px-6 py-4">
                <div className="w-12 h-12 bg-surface-container rounded-lg overflow-hidden flex items-center justify-center">
                  {product.image ? (
                    <img alt="Product" className="w-full h-full object-cover" src={product.image} />
                  ) : (
                    <Image className="w-6 h-6 text-outline-variant" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 font-label-md text-on-surface">{product.name}</td>
              <td className="px-6 py-4 font-body-sm text-on-surface-variant max-w-xs truncate">
                {product.description || "-"}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {product.variants.map((v) => (
                    <span key={v.id} className="px-2 py-0.5 bg-surface-container text-primary rounded-md font-label-sm text-[10px]">
                      {v.size.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 flex gap-2">
                <button
                  onClick={() => router.push(`/pages/kasir/product/${product.id}`)}
                  className="p-2 hover:bg-primary-container/20 rounded-full text-primary transition-all"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this product?")) {
                      onDelete(product.id);
                    }
                  }}
                  className="p-2 hover:bg-error-container/20 rounded-full text-error transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
