"use client";

import { useEffect } from "react";
import { useOrder } from "../../hooks/useOrder";
import { OrderTableKasir } from "../../component/orderTableKasir";

export default function AdminOrderPage() {
  const { orders, loading, error, fetchOrders } = useOrder();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <main className="flex-1 p-xl overflow-y-auto ml-72">
        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <section className="bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant overflow-hidden">
          <div className="p-lg flex justify-between items-center bg-surface-container-low/50 border-b border-outline-variant">
            <h3 className="headline-md text-on-surface">Daftar Pesanan</h3>
          </div>

          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="spinner !border-primary !border-t-transparent w-8 h-8 rounded-full border-4"></div>
            </div>
          ) : (
            <OrderTableKasir orders={orders} />
          )}
        </section>
      </main>
  );
}