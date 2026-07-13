"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCart } from "../context/CartContext";
import { ArrowLeft, MapPin, CheckCircle, Truck, Store, Loader2, Banknote, CreditCard } from "lucide-react";
import { orderService } from "@/app/service/orderService";

const AddressMap = dynamic(() => import("../../component/AddressMap"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-surface-container-high rounded-xl animate-pulse flex items-center justify-center text-on-surface-variant">Loading Map...</div>
});

export default function DetailOrderPage() {
  const router = useRouter();
  const { cart, subtotal, total, clearCart } = useCart();
  
  const [isDelivery, setIsDelivery] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "COD">("CASH");
  const [note, setNote] = useState("");
  const [addressLabel, setAddressLabel] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (isDelivery && (!addressDetail || !latitude || !longitude)) {
      alert("Silakan lengkapi alamat pengiriman dan pilih lokasi di peta.");
      return;
    }

    setLoading(true);

    const payload = {
      items: cart.map(item => ({
        variantId: item.variant.id,
        quantity: item.quantity,
        price: item.variant.price
      })),
      total,
      note,
      paymentMethod,
      ...(isDelivery ? {
        newAddress: addressDetail,
        addressLabel: addressLabel || "Alamat Pengiriman",
        latitude: latitude as number,
        longitude: longitude as number,
      } : {})
    };

    const res = await orderService.createOrder(payload);
    
    if (res.success) {
      clearCart();
      
      // Jika pesanan transfer dan ada link midtrans, tampilkan popup Midtrans Snap
      if (res.data?.midtrans?.token) {
        // @ts-ignore - mengabaikan tipe global object window.snap
        window.snap.pay(res.data.midtrans.token, {
          onSuccess: function() {
            router.push("/pages/kasir");
          },
          onPending: function() {
            router.push("/pages/kasir");
          },
          onError: function() {
            alert("Pembayaran gagal atau terjadi kesalahan!");
            router.push("/pages/kasir");
          },
          onClose: function() {
            alert("Anda menutup popup tanpa menyelesaikan pembayaran. Status pesanan akan tetap PENDING.");
            router.push("/pages/kasir");
          }
        });
      } else {
        router.push("/pages/kasir"); // Redirect ke history jika cash/cod
      }
    } else {
      alert("Gagal membuat pesanan: " + res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Header */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Checkout Pesanan</h2>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
              
              <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
                <h3 className="font-title-lg text-title-lg font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Metode Pemesanan
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div 
                    onClick={() => setIsDelivery(false)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${!isDelivery ? "border-primary bg-primary-container text-on-primary-container" : "border-outline-variant hover:border-outline bg-surface text-on-surface-variant"}`}
                  >
                    <Store className={`w-8 h-8 ${!isDelivery ? "text-primary" : "text-on-surface-variant"}`} />
                    <span className="font-label-lg font-bold">Ambil di Toko</span>
                  </div>
                  <div 
                    onClick={() => setIsDelivery(true)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isDelivery ? "border-primary bg-primary-container text-on-primary-container" : "border-outline-variant hover:border-outline bg-surface text-on-surface-variant"}`}
                  >
                    <Truck className={`w-8 h-8 ${isDelivery ? "text-primary" : "text-on-surface-variant"}`} />
                    <span className="font-label-lg font-bold">Pengiriman</span>
                  </div>
                </div>

                <h3 className="font-title-lg text-title-lg font-bold mt-8 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Metode Pembayaran
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div 
                    onClick={() => setPaymentMethod("CASH")}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === "CASH" ? "border-primary bg-primary-container text-on-primary-container" : "border-outline-variant hover:border-outline bg-surface text-on-surface-variant"}`}
                  >
                    <Banknote className={`w-8 h-8 ${paymentMethod === "CASH" ? "text-primary" : "text-on-surface-variant"}`} />
                    <span className="font-label-lg font-bold">Tunai (Cash)</span>
                  </div>
                  <div 
                    onClick={() => setPaymentMethod("TRANSFER")}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === "TRANSFER" ? "border-primary bg-primary-container text-on-primary-container" : "border-outline-variant hover:border-outline bg-surface text-on-surface-variant"}`}
                  >
                    <CreditCard className={`w-8 h-8 ${paymentMethod === "TRANSFER" ? "text-primary" : "text-on-surface-variant"}`} />
                    <span className="font-label-lg font-bold">Transfer</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-on-surface">Catatan Pesanan (Opsional)</label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tambahkan catatan khusus untuk pesanan ini..."
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none font-body-md min-h-[100px] resize-y"
                  />
                </div>
              </div>

              {isDelivery && (
                <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="font-title-lg text-title-lg font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Detail Pengiriman
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-label-md text-on-surface">Label Alamat</label>
                        <input 
                          type="text"
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                          placeholder="Contoh: Rumah, Kantor, Kosan"
                          className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none font-body-md"
                          required={isDelivery}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-label-md text-on-surface">Alamat Lengkap</label>
                      <textarea 
                        value={addressDetail}
                        onChange={(e) => setAddressDetail(e.target.value)}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none font-body-md resize-none h-24"
                        required={isDelivery}
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="font-label-md text-on-surface flex justify-between">
                        <span>Pilih Lokasi Peta</span>
                        {latitude && longitude && (
                          <span className="text-primary font-label-sm">
                            {latitude.toFixed(5)}, {longitude.toFixed(5)}
                          </span>
                        )}
                      </label>
                      <AddressMap onLocationSelect={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                      }} />
                      {(!latitude || !longitude) && (
                        <p className="text-error text-sm mt-1">Silakan klik pada peta untuk menentukan titik koordinat lokasi.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm sticky top-24 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
              <div className="p-6 border-b border-outline-variant flex-shrink-0">
                <h3 className="font-title-lg text-title-lg font-bold">Ringkasan Pesanan</h3>
              </div>
              
              <div className="p-6 overflow-y-auto no-scrollbar space-y-4 flex-1">
                {cart.length === 0 ? (
                  <p className="text-on-surface-variant text-center py-4">Keranjang kosong.</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-start">
                      <div className="w-16 h-16 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img className="w-full h-full object-cover" src={item.product.images.find(img => img.isPrimary)?.url || item.product.images[0].url} alt={item.product.name} />
                        ) : (
                          <div className="w-full h-full bg-slate-200"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-label-md text-on-surface line-clamp-1">{item.product.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <p className="font-body-sm text-on-surface-variant">
                            {item.variant.size.name} x {item.quantity}
                          </p>
                          <p className="font-label-md text-on-surface">
                            Rp {(item.variant.price * item.quantity).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-surface-container-low border-t border-outline-variant flex-shrink-0">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-on-surface-variant font-body-md">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  {isDelivery && (
                    <div className="flex justify-between text-on-surface-variant font-body-md">
                      <span>Biaya Pengiriman</span>
                      <span>Menyusul</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-outline-variant flex justify-between text-on-surface font-headline-sm font-bold">
                    <span>Total</span>
                    <span className="text-primary">Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <button 
                  type="submit"
                  form="checkout-form"
                  disabled={cart.length === 0 || loading}
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-lg font-bold hover:bg-primary-container transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buat Pesanan"}
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}