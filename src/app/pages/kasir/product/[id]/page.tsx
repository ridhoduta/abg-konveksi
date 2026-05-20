"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { authService, AuthUser } from "@/app/service/authService";
import { useProduct } from "@/app/pages/hooks/useProduct";
import { Pencil, PlusCircle, Trash2, X, Lightbulb, Bell, HelpCircle } from "lucide-react";


export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { sizes, categories, fetchSizes, fetchCategories, getProduct, updateProduct } = useProduct();
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [variants, setVariants] = useState<{ sizeId: number; price: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [newSizeName, setNewSizeName] = useState("");
  const [isAddingSize, setIsAddingSize] = useState(false);

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
    fetchSizes();
    fetchCategories();
    loadProduct();
  }, [router, fetchSizes, fetchCategories, id]);

  const handleLogout = async () => {
    await authService.logout();
    router.push("/pages/login");
  };

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const product = await getProduct(parseInt(id));
      if (product) {
        setName(product.name || "");
        setDescription(product.description || "");
        setImage(product.image || "");
        setCategoryId(product.categoryId || "");
        
        if (product.variants) {
          setVariants(product.variants.map((v: any) => ({
            sizeId: v.sizeId,
            price: v.price
          })));
        }
      }
    } catch (error: any) {
      alert("Failed to load product: " + error.message);
      router.push("/pages/kasir/product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariant = () => {
    if (sizes.length === 0) {
      alert("Please add at least one Size first.");
      setIsAddingSize(true);
      return;
    }
    setVariants([...variants, { sizeId: sizes[0].id, price: 0 }]);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/product/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (res.ok) {
        await fetchCategories();
        setNewCategoryName("");
        setIsAddingCategory(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add category");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding category");
    }
  };

  const handleAddSize = async () => {
    if (!newSizeName.trim()) return;
    try {
      const res = await fetch("/api/product/size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSizeName.trim() }),
      });
      if (res.ok) {
        await fetchSizes();
        setNewSizeName("");
        setIsAddingSize(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add size");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding size");
    }
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleVariantChange = (index: number, field: "sizeId" | "price", value: number) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Product name is required");
    if (categoryId === "") return alert("Category is required");
    
    try {
      setIsSubmitting(true);
      await updateProduct(parseInt(id), {
        name,
        description,
        image,
        categoryId: Number(categoryId),
        variants
      });
      router.push("/pages/kasir/product");
    } catch (err: any) {
      alert(err.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
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
      <header className="bg-surface dark:bg-white-120flex justify-between items-center h-16 w-full pl-80 pr-margin-desktop fixed top-0 border-b border-outline-variant dark:border-outline z-40">
        <div className="flex items-center gap-6">
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-on-surface-variant">Edit Product</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
            <Bell className="w-5 h-5 text-on-surface-variant" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant">
            <HelpCircle className="w-5 h-5" />
            <span className="font-label-md text-label-md">Help</span>
          </button>
          <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
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
      <main className="  ml-72
    pt-16
    min-h-screen
    bg-slate-50
    p-4
    md:p-6
    lg:p-8">
      <section className="mb-6 pt-16">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 md:p-6 border border-outline-variant rounded-2xl shadow-sm">
          <div className="flex items-center gap-8">
            <h2 className="headline-md font-bold text-on-surface">Product Inventory</h2>
          </div>
        </header>
      </section>

        {isLoading ? (
          <div className="flex justify-center p-xl">
            <div className="spinner !border-primary !border-t-transparent w-8 h-8 rounded-full border-4"></div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-gutter items-start">
            <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant p-lg">
              <div className="flex items-center gap-4 mb-lg">
                <div className="w-10 h-10 bg-primary-container/10 text-primary rounded-lg flex items-center justify-center">
                  <Pencil className="w-6 h-6" />
                </div>
                <h3 className="headline-md text-on-surface">Edit Product</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="space-y-base">
                    <label className="font-label-md text-label-md text-on-surface">Product Name</label>
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="e.g. Classic Denim Jacket" 
                      type="text" 
                      required 
                    />
                  </div>
                  <div className="space-y-base">
                    <div className="flex justify-between items-center">
                      <label className="font-label-md text-label-md text-on-surface">Category</label>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingCategory(!isAddingCategory)}
                        className="text-primary font-label-sm hover:underline flex items-center gap-1"
                      >
                        <PlusCircle className="w-4 h-4" /> {isAddingCategory ? "Cancel" : "New Category"}
                      </button>
                    </div>
                    {isAddingCategory ? (
                      <div className="flex gap-2">
                        <input 
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="flex-1 px-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder="e.g. T-Shirt"
                        />
                        <button 
                          type="button"
                          onClick={handleAddCategory}
                          className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md hover:opacity-90"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <select 
                        value={categoryId}
                        onChange={(e) => setCategoryId(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                        required
                      >
                        <option value="" disabled>Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="space-y-base">
                  <label className="font-label-md text-label-md text-on-surface">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" 
                    placeholder="Describe the material, fit, and care instructions..." 
                    rows={4}
                  ></textarea>
                </div>

                {/* Dynamic Variants Section */}
                <div className="space-y-lg">
                  <div className="flex justify-between items-center">
                    <label className="font-label-md text-label-md text-on-surface">Product Variants & Pricing</label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setIsAddingSize(!isAddingSize)} className="text-secondary font-label-sm text-label-sm flex items-center gap-1 hover:underline" type="button">
                        <PlusCircle className="w-4 h-4" /> {isAddingSize ? "Cancel Size" : "New Size"}
                      </button>
                      <button onClick={handleAddVariant} className="text-primary font-label-sm text-label-sm flex items-center gap-1 hover:underline" type="button">
                        <PlusCircle className="w-[18px] h-[18px]" /> Add Variant
                      </button>
                    </div>
                  </div>
                  {isAddingSize && (
                    <div className="flex gap-2 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                      <input 
                        value={newSizeName}
                        onChange={(e) => setNewSizeName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="e.g. XL, XXL, All Size"
                      />
                      <button 
                        type="button"
                        onClick={handleAddSize}
                        className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90"
                      >
                        Save Size
                      </button>
                    </div>
                  )}

                  {sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-sm text-on-surface-variant flex items-center">Available Sizes:</span>
                      {sizes.map((s) => (
                        <span key={s.id} className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-medium border border-outline-variant">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                    {variants.map((variant, index) => (
                      <div key={index} className="p-4 bg-surface-container-low border border-outline-variant rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <select 
                            value={variant.sizeId}
                            onChange={(e) => handleVariantChange(index, "sizeId", parseInt(e.target.value))}
                            className="bg-transparent border-none font-label-sm text-on-surface-variant outline-none cursor-pointer focus:ring-0 p-0"
                          >
                            {sizes.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <button onClick={() => handleRemoveVariant(index)} className="text-error hover:opacity-70 transition-opacity" type="button">
                            <Trash2 className="w-[18px] h-[18px]" />
                          </button>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md">Rp</span>
                          <input 
                            value={variant.price || ""}
                            onChange={(e) => handleVariantChange(index, "price", parseInt(e.target.value) || 0)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                            type="number" 
                          />
                        </div>
                      </div>
                    ))}
                    {variants.length === 0 && (
                      <div className="col-span-full p-4 border border-dashed border-outline-variant rounded-xl text-center text-on-surface-variant text-sm">
                        No variants added. Click "Add Variant" to set prices for different sizes.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-lg flex justify-end gap-4 border-t border-outline-variant">
                  <button 
                    onClick={() => router.back()}
                    className="px-8 py-3 border border-outline-variant rounded-xl font-label-md text-label-md hover:bg-surface-container transition-colors" 
                    type="button"
                  >
                    Discard
                  </button>
                  <button 
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50" 
                    type="submit"
                  >
                    {isSubmitting ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </section>

            {/* Media Upload Section */}
            <section className="col-span-12 lg:col-span-4 space-y-gutter">
              <div className="bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant p-lg">
                <label className="font-label-md text-label-md text-on-surface block mb-base">Product Images</label>
                
                <div className="space-y-4">
                  <div className="space-y-base">
                    <label className="text-sm text-on-surface-variant">Image URL</label>
                    <input 
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  
                  {image && (
                    <div className="aspect-square rounded-lg border border-outline-variant bg-surface overflow-hidden relative group">
                      <img alt="Thumbnail" className="w-full h-full object-cover" src={image} />
                      <button onClick={(e) => { e.preventDefault(); setImage(""); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <X className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-primary-container/10 rounded-xl p-lg border border-primary/20">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-6 h-6 text-primary fill-primary" />
                  <div className="space-y-base">
                    <h4 className="font-label-md text-label-md text-primary">Pro Tip</h4>
                    <p className="font-body-sm text-body-sm text-on-primary-fixed-variant">Detailed descriptions and consistent 1:1 image ratios can increase sales by 40% on the POS interface.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}