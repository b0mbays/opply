import type { Order, OrderDetail } from "../types";
import api from "./api";

export async function fetchOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/api/orders/");
  return response.data;
}

export async function fetchOrder(id: number): Promise<OrderDetail> {
  const response = await api.get<OrderDetail>(`/api/orders/${id}/`);
  return response.data;
}

export async function transitionOrder(id: number, status: string): Promise<OrderDetail> {
  const response = await api.post<OrderDetail>(`/api/orders/${id}/transition/`, { status });
  return response.data;
}

export async function createOrder(
  items: { ingredient_id: number; quantity: number }[]
): Promise<OrderDetail> {
  const response = await api.post<OrderDetail>("/api/orders/", { items });
  return response.data;
}
