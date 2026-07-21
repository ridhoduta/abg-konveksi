"use client";

import { Eye, ChevronDown } from "lucide-react";
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

const DAY_OPTIONS = [
  { value: "", label: "Semua Hari" },
  { value: "0", label: "Minggu" },
  { value: "1", label: "Senin" },
  { value: "2", label: "Selasa" },
  { value: "3", label: "Rabu" },
  { value: "4", label: "Kamis" },
  { value: "5", label: "Jumat" },
  { value: "6", label: "Sabtu" },
];

const toDateInputValue = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toMonthInputValue = (value: string) => toDateInputValue(value).slice(0, 7);

export function OrderTableKasir({ orders }: { orders: any[] }) {
  const router = useRouter();

  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = React.useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = React.useState("");
  const [filterDate, setFilterDate] = React.useState("");
  const [filterMonth, setFilterMonth] = React.useState("");
  const [filterDay, setFilterDay] = React.useState("");

  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const orderDate = toDateInputValue(o.createdAt);
      const orderMonth = toMonthInputValue(o.createdAt);
      const orderDay = new Date(o.createdAt).getDay().toString();
      const matchStatus = !filterStatus || o.status === filterStatus;
      const matchPayStatus = !filterPaymentStatus || o.paymentStatus === filterPaymentStatus;
      const matchMethod = !filterPaymentMethod || o.payment?.[0]?.method === filterPaymentMethod;
      const matchDate = !filterDate || orderDate === filterDate;
      const matchMonth = !filterMonth || orderMonth === filterMonth;
      const matchDay = !filterDay || orderDay === filterDay;
      return matchStatus && matchPayStatus && matchMethod && matchDate && matchMonth && matchDay;
    });
  }, [orders, filterStatus, filterPaymentStatus, filterPaymentMethod, filterDate, filterMonth, filterDay]);

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

  const hasFilter = filterStatus || filterPaymentStatus || filterPaymentMethod || filterDate || filterMonth || filterDay;

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

  const DateFilter = ({
    value, onChange, type, label,
  }: { value: string; onChange: (v: string) => void; type: "date" | "month"; label: string }) => (
    <label className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
      <span className="text-on-surface-variant">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent focus:outline-none cursor-pointer"
      />
    </label>
  );

  return (
    <div className="flex flex-col w-full">
      {/* Filter Bar */}
      <div className="px-lg py-md flex flex-wrap gap-3 items-center border-b border-outline-variant bg-surface-container-low/30">
        <SelectFilter value={filterStatus} onChange={setFilterStatus} options={STATUS_OPTIONS} />
        <SelectFilter value={filterPaymentStatus} onChange={setFilterPaymentStatus} options={PAYMENT_STATUS_OPTIONS} />
        <SelectFilter value={filterPaymentMethod} onChange={setFilterPaymentMethod} options={PAYMENT_METHOD_OPTIONS} />
        <DateFilter value={filterDate} onChange={setFilterDate} type="date" label="Tanggal" />
        <DateFilter value={filterMonth} onChange={setFilterMonth} type="month" label="Bulan" />
        <SelectFilter value={filterDay} onChange={setFilterDay} options={DAY_OPTIONS} />

        {hasFilter && (
          <button
            onClick={() => { setFilterStatus(""); setFilterPaymentStatus(""); setFilterPaymentMethod(""); setFilterDate(""); setFilterMonth(""); setFilterDay(""); }}
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
    </div>
  );
}