"use client";

import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export function OrderTableKasir({ orders, onDelete }: { orders: any[], onDelete: (id: number) => void }) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900";
      case "PROCESSING": return "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900";
      case "SHIPPED": return "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900";
      case "DONE": return "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900";
      case "CANCELLED": return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900";
      default: return "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
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
                  <div className="font-bold">{order.customer ? order.customer.name : "Guest / Walk-in"}</div>
                  <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    {order.address ? (
                      <span className="px-2 py-0.5 bg-primary-container text-on-primary-container rounded-sm">Delivery</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded-sm">Pickup</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-body-md font-bold text-primary">Rp {order.total.toLocaleString("id-ID")}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full font-label-sm text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => router.push(`/pages/kasir/order/${order.id}`)}
                    className="p-2 bg-primary-container text-on-primary-container rounded-lg hover:bg-primary hover:text-on-primary transition-colors inline-block shadow-sm"
                    title="Detail"
                  >
                    <Eye className="w-4 h-4" />
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