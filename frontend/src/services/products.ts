import type { Product, ProductDetail } from "../types";
import api from "./api";

export async function fetchProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>("/api/products/");
  return response.data;
}

export async function fetchProduct(id: number): Promise<ProductDetail> {
  const response = await api.get<ProductDetail>(`/api/products/${id}/`);
  return response.data;
}

export async function createProduct(
  name: string,
  description: string,
  ingredients: { ingredient_id: number; quantity: string }[]
): Promise<ProductDetail> {
  const response = await api.post<ProductDetail>("/api/products/", {
    name,
    description,
    ingredients,
  });
  return response.data;
}

export async function updateProduct(
  id: number,
  data: {
    name?: string;
    description?: string;
    ingredients?: { ingredient_id: number; quantity: string }[];
  }
): Promise<ProductDetail> {
  const response = await api.patch<ProductDetail>(`/api/products/${id}/`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/api/products/${id}/`);
}
