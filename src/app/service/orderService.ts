import { ProductVariant } from "../pages/hooks/useProduct";

export interface OrderItem {
  variantId: number;
  quantity: number;
  price: number;
}

export interface OrderPayload {
  items: OrderItem[];
  total: number;
  customerId?: number | null;
  addressId?: number | null;
  note?: string;
  // Nested address payload
  newAddress?: string;
  addressLabel?: string;
  latitude?: number;
  longitude?: number;
}

export interface OrderResponse {
  id: number;
  customerId: number | null;
  addressId: number | null;
  userId: number | null;
  status: string;
  total: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  createOrder: async (payload: OrderPayload) => {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { success: res.ok, data: data.data, message: data.message };
  },

  getOrders: async () => {
    const res = await fetch("/api/order");
    const data = await res.json();
    return { success: res.ok, data: data.data, message: data.message };
  },

  getOrderById: async (id: number) => {
    const res = await fetch(`/api/order/${id}`);
    const data = await res.json();
    return { success: res.ok, data: data.data, message: data.message };
  },

  updateOrderStatus: async (id: number, status: string, note?: string) => {
    const res = await fetch(`/api/order/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note })
    });
    const data = await res.json();
    return { success: res.ok, data: data.data, message: data.message };
  },

  deleteOrder: async (id: number) => {
    const res = await fetch(`/api/order/${id}`, {
      method: "DELETE"
    });
    const data = await res.json();
    return { success: res.ok, message: data.message };
  }
};