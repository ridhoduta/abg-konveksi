"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminSidebar } from "@/components/adminSidebar";
import { orderService } from "@/app/service/orderService";
import { ArrowLeft, Save, MapPin, Truck, Store, User, Clock, FileText } from "lucide-react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    import("leaflet").then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      import("leaflet/dist/leaflet.css");
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      const res = await orderService.getOrderById(id);
      if (res.success) {
        setOrder(res.data);
        setStatus(res.data.status);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    setSaving(true);
    const res = await orderService.updateOrderStatus(id, status);
    if (res.success) {
      alert("Status berhasil diperbarui");
      setOrder({ ...order, status });
    } else {
      alert("Gagal memperbarui status");
    }
    setSaving(false);
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900";
      case "PROCESSING": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900";
      case "SHIPPED": return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900";
      case "DONE": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-surface-dim font-sans text-on-surface">
        <AdminSidebar activePath="pesanan" />
        <main className="flex-1 p-xl overflow-y-auto ml-72 flex justify-center items-center">
          <div className="spinner !border-primary !border-t-transparent w-10 h-10 rounded-full border-4"></div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen bg-surface-dim font-sans text-on-surface">
        <AdminSidebar activePath="pesanan" />
        <main className="flex-1 p-xl overflow-y-auto ml-72">
          <p className="text-on-surface-variant text-center mt-20">Pesanan tidak ditemukan.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-dim font-sans text-on-surface">
      <AdminSidebar activePath="pesanan" />

      <main className="flex-1 p-xl overflow-y-auto ml-72">
        <header className="flex flex-wrap items-center gap-4 mb-xl bg-surface-container-lowest p-lg border border-outline-variant rounded-sm shadow-sm">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="headline-md font-bold text-on-surface flex items-center gap-3">
              Detail Pesanan: ORD-{String(order.id).padStart(4, '0')}
              <span className={`px-3 py-1 rounded-full font-label-sm text-xs font-bold border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg px-4 py-2 font-label-md outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DONE">DONE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button 
              onClick={handleUpdateStatus}
              disabled={saving || status === order.status}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Update Status"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
              <h3 className="font-title-lg font-bold mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
                <FileText className="w-5 h-5 text-primary" /> Daftar Item
              </h3>
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                    <div className="w-16 h-16 bg-surface-variant rounded-md overflow-hidden">
                      {item.variant.product.image ? (
                        <img src={item.variant.product.image} alt={item.variant.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-200"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-label-lg font-bold">{item.variant.product.name}</h4>
                      <p className="font-body-sm text-on-surface-variant">Size: {item.variant.size.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-label-md font-bold text-primary">Rp {item.price.toLocaleString("id-ID")}</p>
                      <p className="font-body-sm text-on-surface-variant">x {item.quantity}</p>
                    </div>
                    <div className="w-32 text-right">
                      <p className="font-title-sm font-bold">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-outline-variant pt-4 flex justify-between items-center text-lg">
                <span className="font-bold">Total Pembayaran:</span>
                <span className="font-headline-sm font-bold text-primary">Rp {order.total.toLocaleString("id-ID")}</span>
              </div>
            </section>

            {order.address && (
              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
                <h3 className="font-title-lg font-bold mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
                  <MapPin className="w-5 h-5 text-primary" /> Peta Pengiriman
                </h3>
                <div className="h-[400px] w-full rounded-xl overflow-hidden border border-outline-variant z-0 relative">
                   <MapContainer 
                    center={[order.address.latitude, order.address.longitude]} 
                    zoom={15} 
                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                  >
                    <TileLayer 
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[order.address.latitude, order.address.longitude]} />
                  </MapContainer>
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
              <h3 className="font-title-md font-bold mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
                <User className="w-5 h-5 text-primary" /> Info Pelanggan
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-label-sm text-on-surface-variant">Nama Pelanggan</p>
                  <p className="font-body-md font-bold">{order.customer ? order.customer.name : "Guest / Walk-in"}</p>
                </div>
                {order.customer?.email && (
                  <div>
                    <p className="font-label-sm text-on-surface-variant">Email</p>
                    <p className="font-body-md">{order.customer.email}</p>
                  </div>
                )}
                {order.customer?.phone && (
                  <div>
                    <p className="font-label-sm text-on-surface-variant">Telepon</p>
                    <p className="font-body-md">{order.customer.phone}</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
              <h3 className="font-title-md font-bold mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
                <Truck className="w-5 h-5 text-primary" /> Info Pengiriman
              </h3>
              {order.address ? (
                <div className="space-y-3">
                  <span className="px-3 py-1 bg-primary-container text-on-primary-container font-label-sm rounded-full inline-block mb-2">Delivery</span>
                  <div>
                    <p className="font-label-sm text-on-surface-variant">Label Alamat</p>
                    <p className="font-body-md font-bold">{order.address.label}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant">Alamat Lengkap</p>
                    <p className="font-body-md">{order.address.address}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant">Koordinat</p>
                    <p className="font-body-md text-sm text-primary font-mono">{order.address.latitude}, {order.address.longitude}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Store className="w-12 h-12 text-on-surface-variant mx-auto mb-2 opacity-50" />
                  <p className="font-body-md text-on-surface-variant">Pelanggan mengambil barang langsung di toko (Pickup).</p>
                </div>
              )}
            </section>

            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
              <h3 className="font-title-md font-bold mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
                <Clock className="w-5 h-5 text-primary" /> Info Pesanan
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-label-sm text-on-surface-variant">Dibuat Pada</p>
                  <p className="font-body-md">{new Date(order.createdAt).toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Kasir / Admin</p>
                  <p className="font-body-md">{order.createdBy ? order.createdBy.username : "-"}</p>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Catatan Tambahan</p>
                  <p className="font-body-md italic bg-surface-container-low p-3 rounded-lg border border-outline-variant mt-1">
                    {order.note || "Tidak ada catatan."}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}