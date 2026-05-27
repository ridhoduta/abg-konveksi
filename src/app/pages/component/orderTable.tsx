"use client";

import { Eye, Trash2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DONE", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "Semua Status Bayar" },
  { value: "PAID", label: "Lunas" },
  { value: "UNPAID", label: "Belum Bayar" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "Semua Metode" },
  { value: "CASH", label: "Cash" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "COD", label: "COD" },
];

export function OrderTable({ orders, onDelete }: { orders: any[], onDelete: (id: number) => void }) {
  const router = useRouter();

  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = React.useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = React.useState("");

  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = !filterStatus || o.status === filterStatus;
      const matchPayStatus = !filterPaymentStatus || o.paymentStatus === filterPaymentStatus;
      const matchMethod = !filterPaymentMethod || o.payment?.[0]?.method === filterPaymentMethod;
      return matchStatus && matchPayStatus && matchMethod;
    });
  }, [orders, filterStatus, filterPaymentStatus, filterPaymentMethod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-50 text-yellow-800 border border-yellow-200";
      case "PROCESSING": return "bg-blue-50 text-blue-800 border border-blue-200";
      case "SHIPPED": return "bg-purple-50 text-purple-800 border border-purple-200";
      case "DONE": return "bg-green-50 text-green-800 border border-green-200";
      case "CANCELLED": return "bg-red-50 text-red-800 border border-red-200";
      default: return "bg-gray-50 text-gray-800 border border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "MENUNGGU";
      case "PROCESSING": return "DIPROSES";
      case "SHIPPED": return "DIKIRIM";
      case "DONE": return "SELESAI";
      case "CANCELLED": return "BATAL";
      default: return status;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PAID": return "bg-green-50 text-green-800 border border-green-200";
      case "UNPAID": return "bg-red-50 text-red-800 border border-red-200";
      default: return "bg-gray-50 text-gray-800 border border-gray-200";
    }
  };

  const getPaymentStatusLabel = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "PAID": return "LUNAS";
      case "UNPAID": return "BELUM BAYAR";
      default: return paymentStatus;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH": return "bg-teal-50 text-teal-800 border border-teal-200";
      case "TRANSFER": return "bg-indigo-50 text-indigo-800 border border-indigo-200";
      case "COD": return "bg-amber-50 text-amber-800 border border-amber-200";
      default: return "bg-gray-50 text-gray-800 border border-gray-200";
    }
  };

  const hasFilter = filterStatus || filterPaymentStatus || filterPaymentMethod;

  const SelectFilter = ({
    value, onChange, options,
  }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-xs font-medium border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      {/* Filter Bar */}
      <div className="px-lg py-md flex flex-wrap gap-3 items-center border-b border-outline-variant bg-surface-container-low/30">
        <SelectFilter value={filterStatus} onChange={setFilterStatus} options={STATUS_OPTIONS} />
        <SelectFilter value={filterPaymentStatus} onChange={setFilterPaymentStatus} options={PAYMENT_STATUS_OPTIONS} />
        <SelectFilter value={filterPaymentMethod} onChange={setFilterPaymentMethod} options={PAYMENT_METHOD_OPTIONS} />

        {hasFilter && (
          <button
            onClick={() => { setFilterStatus(""); setFilterPaymentStatus(""); setFilterPaymentMethod(""); }}
            className="px-3 py-2 text-xs font-medium text-error border border-error/30 rounded-xl hover:bg-error/10 transition-all"
          >
            Reset Filter
          </button>
        )}

        <span className="ml-auto text-xs text-on-surface-variant">
          Menampilkan{" "}
          <span className="font-bold text-on-surface">{filteredOrders.length}</span>{" "}
          dari {orders.length} pesanan
        </span>
      </div>

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
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                  Tidak ada pesanan yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                  <td className="p-4 font-body-md font-bold">ORD-{String(order.id).padStart(4, "0")}</td>
                  <td className="p-4 font-body-md text-on-surface-variant">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="p-4 font-body-md">
                    <div className="font-bold">{order.customer ? order.customer.name : order.createdBy?.username}</div>
                    <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="px-2 py-0.5 bg-primary-container text-on-primary-container rounded-sm">
                        {order.address ? "Dikirim" : "Ambil Sendiri"}
                      </span>
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
                        if (confirm("Yakin ingin menghapus pesanan ini?")) onDelete(order.id);
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
    </div>
  );
}