"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { authService, AuthUser } from "@/app/service/authService";
import { useProduct, Product, ProductVariant } from "@/app/pages/hooks/useProduct";
import { useCart } from "./context/CartContext";
import { CardProduct, ProductModal } from "@/app/pages/component/cardProduct";
import { Search, Bell, HelpCircle, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingBag } from "lucide-react";

export default function KasirPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const { products, categories, fetchProducts, fetchCategories } = useProduct();
  const { cart, addToCart, updateQuantity, removeFromCart, subtotal, total } = useCart();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "ALL">("ALL");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
    fetchCategories();
  }, [router, fetchProducts, fetchCategories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "ALL" || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

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

      {/* TopNavBar */}
      <header className="bg-surface dark:bg-white-120 flex justify-between items-center h-16 w-full pl-80 pr-margin-desktop fixed top-0 border-b border-outline-variant dark:border-outline z-40">
        <div className="flex items-center gap-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input 
              className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary outline-none font-body-sm text-body-sm" 
              placeholder="Search products..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogout} title="Logout">
            <div className="text-right">
              <p className="font-label-md text-label-md text-on-surface">{user?.username}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Kasir</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-container text-on-primary flex items-center justify-center font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pl-72 pt-16 h-screen w-full overflow-hidden flex">
        {/* Left Section: Product Grid */}
        <section className="flex-1 p-8 overflow-y-auto no-scrollbar bg-slate-50">
          {/* Category Filter Chips */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setSelectedCategory("ALL")}
              className={`px-6 py-2 rounded-full font-label-md text-label-md shadow-sm transition-colors ${selectedCategory === "ALL" ? "bg-primary text-on-primary" : "bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-high"}`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-label-md text-label-md transition-colors ${selectedCategory === cat.id ? "bg-primary text-on-primary shadow-sm" : "bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-high"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Bento-style Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <CardProduct 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)} 
              />
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-on-surface-variant">
                No products found matching your search or category.
              </div>
            )}
          </div>
        </section>

        {/* Right Section: Cart Panel */}
        <section className="w-96 bg-white border-l border-outline-variant flex flex-col h-full shadow-2xl relative z-10 flex-shrink-0">
          <div className="p-6 border-b border-outline-variant">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Current Order</h2>
              <span className="bg-primary-container text-on-primary-container px-2 py-1 rounded-full font-label-sm text-label-sm">{cart.length} Items</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
              <span className="font-body-sm text-body-sm">Guest Customer</span>
            </div>
          </div>
          
          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                  {item.product.image ? (
                    <img className="w-full h-full object-cover" src={item.product.image} alt={item.product.name} />
                  ) : (
                    <div className="w-full h-full bg-slate-200"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-label-md text-label-md text-on-surface line-clamp-2">{item.product.name}</h4>
                    <button onClick={() => removeFromCart(item.id)} className="text-on-surface-variant hover:text-error transition-colors flex-shrink-0 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Size: {item.variant.size.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden h-8">
                      <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, -1) : removeFromCart(item.id)} className="px-2 h-full hover:bg-slate-50 text-on-surface-variant flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 font-label-md text-label-md border-x border-outline-variant h-full flex items-center justify-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="px-2 h-full hover:bg-slate-50 text-on-surface-variant flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface">Rp {(item.variant.price * item.quantity).toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-60">
                <ShoppingBag className="w-12 h-12 mb-4" />
                <p>Cart is empty</p>
              </div>
            ) : null}
          </div>
          
          {/* Summary & Actions */}
          <div className="p-6 bg-surface-container-low border-t border-outline-variant">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-on-surface-variant font-body-md text-body-md">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="pt-3 border-t border-outline-variant flex justify-between text-on-surface font-headline-md text-headline-md font-bold">
                <span>Total</span>
                <span className="text-primary">Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={() => router.push("/pages/kasir/detail")}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline-md text-headline-md hover:bg-primary-container transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:active:scale-100"
            >
              Complete Order
            </button>
          </div>
        </section>
      </main>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={addToCart} 
        />
      )}
    </>
  );
}