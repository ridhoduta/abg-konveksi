import { useState, useEffect, useCallback } from "react";

export interface Size {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sizeId: number;
  price: number;
  size: Size;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  stock: number;
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

export function useProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/product");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch products");
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSizes = useCallback(async () => {
    try {
      const res = await fetch("/api/product/size");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch sizes");
      setSizes(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/product/category");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch categories");
      setCategories(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const getProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/product/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch product");
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  const createProduct = async (productData: any) => {
    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");
      await fetchProducts(); // Refresh list
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  const updateProduct = async (id: number, productData: any) => {
    try {
      const res = await fetch(`/api/product/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update product");
      await fetchProducts();
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteProduct = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/product/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete product");
      }
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    products,
    sizes,
    categories,
    loading,
    error,
    fetchProducts,
    fetchSizes,
    fetchCategories,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}