"use client";

import { Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function OrderTable({ orders, onDelete }: { orders: any[], onDelete: (id: number) => void }) {
  const router = useRouter();
  const getStatusColor = (status: string) => {
    switch(status) {
      case "PENDING": return "bg-yellow-50 text-yellow-800 border border-yellow-200";
      case "PROCESSING": return "bg-blue-50 text-blue-800 border border-blue-200";
      case "SHIPPED": return "bg-purple-50 text-purple-800 border border-purple-200";
      case "DONE": return "bg-green-50 text-green-800 border border-green-200";
      case "CANCELLED": return "bg-red-50 text-red-800 border border-red-200";
      default: return "bg-gray-50 text-gray-800 border border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "PENDING": return "MENUNGGU";
      case "PROCESSING": return "DIPROSES";
      case "SHIPPED": return "DIKIRIM";
      case "DONE": return "SELESAI";
      case "CANCELLED": return "BATAL";
      default: return status;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch(paymentStatus) {
      case "PAID": return "bg-green-50 text-green-800 border border-green-200";
      case "UNPAID": return "bg-red-50 text-red-800 border border-red-200";
      default: return "bg-gray-50 text-gray-800 border border-gray-200";
    }
  };

  const getPaymentStatusLabel = (paymentStatus: string) => {
    switch(paymentStatus) {
      case "PAID": return "LUNAS";
      case "UNPAID": return "BELUM BAYAR";
      default: return paymentStatus;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch(method) {
      case "CASH": return "bg-teal-50 text-teal-800 border border-teal-200";
      case "TRANSFER": return "bg-indigo-50 text-indigo-800 border border-indigo-200";
      case "COD": return "bg-amber-50 text-amber-800 border border-amber-200";
      default: return "bg-gray-50 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-high border-b border-outline-variant">
            <th className="p-4 font-label-md text-on-surface-variant">ID Pesanan</th>
              <th className="p-4 font-label-md text-on-surface-variant">Tanggal</th>
              <th className="p-4 font-label-md text-on-surface-variant">Pelanggan</th>
              <th className="p-4 font-label-md text-on-surface-variant">Total</th>
              <th className="p-4 font-label-md text-on-surface-variant">Status</th>
              <th className="p-4 font-label-md text-on-surface-variant">Status Bayar</th>
              <th className="p-4 font-label-md text-on-surface-variant">Metode</th>
              <th className="p-4 font-label-md text-on-surface-variant">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                Belum ada data pesanan.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                <td className="p-4 font-body-md font-bold">ORD-{String(order.id).padStart(4, '0')}</td>
                <td className="p-4 font-body-md text-on-surface-variant">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-4 font-body-md">
                  <div className="font-bold">{order.customer ? order.customer.name :order.createdBy?.username}</div>
                  <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    {order.address ? (
                      <span className="px-2 py-0.5 bg-primary-container text-on-primary-container rounded-sm">Dikirim</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-primary-container text-on-primary-container rounded-sm">Ambil Sendiri</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-body-md font-bold text-primary">Rp {order.total.toLocaleString("id-ID")}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full font-label-sm text-xs font-bold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full font-label-sm text-xs font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full font-label-sm text-xs font-bold ${getPaymentMethodColor(order.payment?.[0]?.method || "")}`}>
                    {order.payment?.[0]?.method || "-"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => router.push(`/pages/admin/order/${order.id}`)}
                    className="p-2 bg-primary-container text-on-primary-container rounded-lg hover:bg-primary hover:text-on-primary transition-colors inline-block shadow-sm"
                    title="Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm("Yakin ingin menghapus pesanan ini?")) onDelete(order.id);
                    }}
                    className="p-2 bg-error-container text-on-error-container rounded-lg hover:bg-error hover:text-on-error transition-colors inline-block shadow-sm"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}