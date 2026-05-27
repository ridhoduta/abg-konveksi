import React from "react";
import { Product } from "../hooks/useProduct";
import { useRouter } from "next/navigation";
import { Image, Pencil, Trash2, Search } from "lucide-react";

export function ProductTable({ products, onDelete }: { products: Product[], onDelete: (id: number) => void }) {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const categories = React.useMemo(() => {
    const map = new Map<number, string>();
    products.forEach((p) => {
      if (p.category) {
        map.set(p.category.id, p.category.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategoryId === null || p.categoryId === selectedCategoryId;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);
  
  return (
    <div className="flex flex-col w-full">
      {/* Filter Bar */}
      <div className="p-lg flex flex-col md:flex-row md:items-center gap-4 border-b border-outline-variant bg-surface-container-low/30">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl bg-surface-container-lowest text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        {/* Search Input */}

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-on-surface-variant mr-1">Kategori:</span>
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedCategoryId === null
                ? "bg-primary border-primary text-on-primary shadow-sm"
                : "bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedCategoryId === cat.id
                  ? "bg-primary border-primary text-on-primary shadow-sm"
                  : "bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant">
              <th className="px-6 py-4 font-label-sm text-label-sm">ID</th>
              <th className="px-6 py-4 font-label-sm text-label-sm">Image</th>
              <th className="px-6 py-4 font-label-sm text-label-sm">Product Name</th>
              <th className="px-6 py-4 font-label-sm text-label-sm">Category</th>
              <th className="px-6 py-4 font-label-sm text-label-sm">Description</th>
              <th className="px-6 py-4 font-label-sm text-label-sm">Variants</th>
              <th className="px-6 py-4 font-label-sm text-label-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filteredProducts.map((product) => (
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
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-bold">
                    {product.category?.name || "Uncategorized"}
                  </span>
                </td>
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
                    onClick={() => router.push(`/pages/admin/product/${product.id}`)}
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
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
