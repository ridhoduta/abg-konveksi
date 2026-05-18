"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Product, ProductVariant } from "@/app/pages/hooks/useProduct";
import { Minus, Plus, X } from "lucide-react";

interface CardProductProps {
  product: Product;
  onClick: () => void;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    variant: ProductVariant,
    quantity: number
  ) => void;
}

export function CardProduct({
  product,
  onClick,
}: CardProductProps) {
  const lowestPrice = useMemo(() => {
    if (!product.variants?.length) return 0;
    return Math.min(...product.variants.map((v) => v.price));
  }, [product]);

  return (
    <div
      onClick={onClick}
      className="
        bg-white rounded-2xl overflow-hidden
        border border-outline-variant/30
        shadow-sm hover:shadow-xl
        transition-all duration-300
        cursor-pointer group
        flex flex-col h-full
      "
    >
      {/* IMAGE */}
      <div className="relative h-48 bg-slate-100 overflow-hidden flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="
              w-full h-full object-cover
              group-hover:scale-105
              transition-transform duration-500
            "
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
            No Image
          </div>
        )}

        {product.variants?.length > 0 && (
          <span
            className="
              absolute top-3 left-3
              px-3 py-1 rounded-lg
              bg-white/90 backdrop-blur
              text-xs font-medium text-slate-700
            "
          >
            {product.variants.length} Sizes
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-on-surface line-clamp-2">
          {product.name}
        </h3>

        <p className="text-sm text-on-surface-variant mt-1 truncate">
          {product.category?.name}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            {product.variants?.length > 0 && (
              <p className="text-xs text-on-surface-variant">
                Start from
              </p>
            )}

            <p className="text-lg font-bold text-primary">
              Rp {lowestPrice.toLocaleString("id-ID")}
            </p>
          </div>

          <button
            type="button"
            className="
              w-10 h-10 rounded-xl
              bg-primary text-white
              flex items-center justify-center
              hover:scale-95 transition-transform
            "
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductModal({
  product,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const [mounted, setMounted] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    setMounted(true);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const lowestPrice = useMemo(() => {
    if (!product.variants?.length) return 0;
    return Math.min(...product.variants.map((v) => v.price));
  }, [product]);

  const updateQuantity = (variantId: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[variantId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [variantId]: next };
    });
  };

  const handleAdd = () => {
    let hasAdded = false;
    product.variants?.forEach((variant) => {
      const q = quantities[variant.id] || 0;
      if (q > 0) {
        onAddToCart(product, variant, q);
        hasAdded = true;
      }
    });

    if (hasAdded) {
      onClose();
    }
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="
        fixed inset-0 z-[9999]
        bg-black/50 backdrop-blur-sm
        flex items-center justify-center
        p-4
      "
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative
          w-[90vw] max-w-[448px]
          bg-white
          rounded-3xl
          shadow-2xl
          overflow-hidden
          max-h-[90vh]
          flex flex-col
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
          <h2 className="text-xl font-bold text-on-surface">
            Add to Cart
          </h2>

          <button
            onClick={onClose}
            className="
              w-10 h-10 rounded-full
              hover:bg-slate-100
              flex items-center justify-center
              transition-colors
            "
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 overscroll-contain">
          {/* PRODUCT */}
          <div className="flex gap-4 mb-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-on-surface line-clamp-2">
                {product.name}
              </h3>

              <p className="text-sm text-on-surface-variant mt-1">
                {product.category?.name}
              </p>

              <p className="text-xl font-bold text-primary mt-3">
                {product.variants?.length > 1 && (
                  <span className="text-xs font-normal text-on-surface-variant mr-1">
                    Start from
                  </span>
                )}
                Rp {lowestPrice.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* VARIANTS WITH QUANTITY */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-on-surface mb-3">
              Sizes & Quantities
            </label>

            {product.variants?.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-100 text-sm text-slate-500">
                No sizes available
              </div>
            ) : (
              <div className="space-y-3">
                {product.variants.map((variant) => {
                  const qty = quantities[variant.id] || 0;

                  return (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <div>
                        <div className="font-semibold text-on-surface">
                          {variant.size.name}
                        </div>
                        <div className="text-sm text-primary font-medium">
                          Rp {variant.price.toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden h-10 bg-white">
                        <button
                          onClick={() => updateQuantity(variant.id, -1)}
                          className="w-10 h-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="w-10 h-full border-x border-slate-300 flex items-center justify-center font-semibold text-sm">
                          {qty}
                        </div>
                        <button
                          onClick={() => updateQuantity(variant.id, 1)}
                          className="w-10 h-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-outline-variant/20">
          <button
            onClick={handleAdd}
            disabled={totalItems === 0}
            className="
              w-full h-14 rounded-2xl
              bg-primary text-white
              font-semibold
              flex items-center justify-center
              px-6
              shadow-lg
              hover:opacity-90
              active:scale-[0.99]
              transition-all
              disabled:opacity-50
            "
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}