"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProduct } from "@/app/pages/hooks/useProduct";
import { ArrowLeft, PlusSquare, PlusCircle, Trash2, X, Lightbulb, UploadCloud, Loader2 } from "lucide-react";


export default function NewProductPage() {
  const router = useRouter();
  const { sizes, categories, fetchSizes, fetchCategories, createProduct } = useProduct();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [variants, setVariants] = useState<{ sizeId: number; price: number; description?: string; stock: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [newSizeName, setNewSizeName] = useState("");
  const [isAddingSize, setIsAddingSize] = useState(false);

  // States for Multiple Image Upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleSelectFiles = (files: FileList | null) => {
    if (!files) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Ukuran file maksimal adalah 5MB");
        return;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setUploadError(null);
    setSelectedFiles([...selectedFiles, ...newFiles]);
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleSelectFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSelectFiles(e.target.files);
  };

  const handleClearImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    const newUploadedUrls = uploadedUrls.filter((_, i) => i !== index);

    // Revoke blob URL
    if (previewUrls[index] && previewUrls[index].startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls[index]);
    }

    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
    setUploadedUrls(newUploadedUrls);
  };

  const handleClearAllImages = () => {
    previewUrls.forEach(url => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadedUrls([]);
  };

  useEffect(() => {
    fetchSizes();
    fetchCategories();
  }, [fetchSizes, fetchCategories]);

  const handleAddVariant = () => {
    if (sizes.length === 0) {
      alert("Please add at least one Size first.");
      setIsAddingSize(true);
      return;
    }
    setVariants([...variants, { sizeId: sizes[0].id, price: 0, stock: 0 }]);
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

  const handleVariantChange = (index: number, field: "sizeId" | "price" | "stock", value: number) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleVariantDescriptionChange = (index: number, value: string) => {
    const newVariants = [...variants];
    newVariants[index].description = value;
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Product name is required");
    if (categoryId === "") return alert("Category is required");
    
    try {
      setIsSubmitting(true);
      const finalImages: { url: string; isPrimary: boolean; order: number }[] = [];

      // Upload all selected files
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        for (let i = 0; i < selectedFiles.length; i++) {
          const formData = new FormData();
          formData.append("file", selectedFiles[i]);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) {
            throw new Error(uploadData.message || "Gagal mengunggah file ke Supabase");
          }

          if (uploadData.success && uploadData.url?.publicUrl) {
            finalImages.push({
              url: uploadData.url.publicUrl,
              isPrimary: i === 0,
              order: i,
            });
          } else {
            throw new Error("Format respon upload tidak valid");
          }
        }
      }

      await createProduct({
        name,
        description,
        categoryId: Number(categoryId),
        images: finalImages,
        variants
      });
      router.push("/pages/admin/product");
    } catch (err: any) {
      alert(err.message || "Failed to create product");
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 p-xl overflow-y-auto ml-72">
        <header className="flex items-center gap-4 mb-xl bg-surface-container-lowest p-lg border border-outline-variant rounded-sm shadow-sm">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="headline-md font-bold text-on-surface">Factory Management</h2>
        </header>

        <div className="grid grid-cols-12 gap-gutter items-start">
          <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant p-lg">
            <div className="flex items-center gap-4 mb-lg">
              <div className="w-10 h-10 bg-primary-container/10 text-primary rounded-lg flex items-center justify-center">
                <PlusSquare className="w-6 h-6" />
              </div>
              <h3 className="headline-md text-on-surface">Add New Product</h3>
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
                
                <div className="space-y-md">
                  {variants.map((variant, index) => (
                    <div key={index} className="p-6 bg-surface-container-low border border-outline-variant rounded-xl space-y-4">
                      <div className="flex justify-between items-center">
                        <select 
                          value={variant.sizeId}
                          onChange={(e) => handleVariantChange(index, "sizeId", parseInt(e.target.value))}
                          className="bg-transparent border-none font-label-md text-on-surface outline-none cursor-pointer focus:ring-0 p-0"
                        >
                          {sizes.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <button onClick={() => handleRemoveVariant(index)} className="text-error hover:opacity-70 transition-opacity" type="button">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm text-on-surface-variant">Price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md">Rp</span>
                            <input 
                              value={variant.price || ""}
                              onChange={(e) => handleVariantChange(index, "price", parseInt(e.target.value) || 0)}
                              className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 outline-none" 
                              type="number" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm text-on-surface-variant">Stock</label>
                          <input
                            value={variant.stock || ""}
                            onChange={(e) => handleVariantChange(index, "stock", parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                            type="number"
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="font-label-sm text-label-sm text-on-surface-variant">Variant Description</label>
                        <input
                          value={variant.description || ""}
                          onChange={(e) => handleVariantDescriptionChange(index, e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 outline-none"
                          placeholder="e.g. Red color"
                        />
                      </div>
                    </div>
                  ))}
                  {variants.length === 0 && (
                    <div className="p-4 border border-dashed border-outline-variant rounded-xl text-center text-on-surface-variant text-sm">
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
                  disabled={isSubmitting || isUploading}
                  className="px-8 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50" 
                  type="submit"
                >
                  {isUploading ? "Uploading Image..." : isSubmitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </section>

          {/* Media Upload Section */}
          <section className="col-span-12 lg:col-span-4 space-y-gutter">
            <div className="bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant p-lg">
              <label className="font-label-md text-label-md text-on-surface block mb-base">Product Images</label>
              
              <div className="space-y-4">
                {/* Image Previews Grid */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img alt={`Preview ${index + 1}`} className="w-full h-full object-cover" src={url} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleClearImage(index)}
                            className="p-2 bg-error text-white rounded-full hover:bg-error/80 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <span className="text-xs bg-primary text-white px-2 py-1 rounded-full font-medium">Primary</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drag and Drop Zone */}
                <div 
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                    dragActive 
                      ? "border-primary bg-primary/5 scale-[1.01]" 
                      : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-low"
                  } relative`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="image-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    disabled={isUploading || isSubmitting}
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-sm font-medium text-on-surface">Uploading to Supabase...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center space-y-2 py-4">
                      <div className="p-3 bg-primary/10 text-primary rounded-full">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-semibold text-on-surface">Unggah gambar produk</span>
                      <span className="text-xs text-on-surface-variant">PNG, JPG, WEBP maks 5MB (Multiple)</span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div className="text-xs font-semibold text-error bg-error-container/20 p-3 rounded-lg border border-error/20 flex justify-between items-center">
                    <span>{uploadError}</span>
                    <button 
                      onClick={() => setUploadError(null)}
                      className="p-1 hover:bg-error-container/40 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {previewUrls.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllImages}
                    className="w-full text-xs font-medium text-error hover:underline flex items-center justify-center gap-1 py-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Gambar
                  </button>
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
      </main>
  );
}