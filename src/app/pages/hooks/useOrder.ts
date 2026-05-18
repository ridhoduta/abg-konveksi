"use client";

import { useState, useCallback } from "react";
import { orderService } from "@/app/service/orderService";

export function useOrder() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrders();
      if (res.success) {
        setOrders(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (id: number, status: string, note?: string) => {
    const res = await orderService.updateOrderStatus(id, status, note);
    if (res.success) {
      setOrders((prev) => prev.map(o => o.id === id ? { ...o, status, ...(note !== undefined && { note }) } : o));
    }
    return res;
  };

  const deleteOrder = async (id: number) => {
    const res = await orderService.deleteOrder(id);
    if (res.success) {
      setOrders((prev) => prev.filter(o => o.id !== id));
    }
    return res;
  };

  return { orders, loading, error, fetchOrders, updateStatus, deleteOrder };
}