import type { Supplier, Ingredient } from "../types";
import api from "./api";

export async function fetchSuppliers(): Promise<Supplier[]> {
  const response = await api.get<Supplier[]>("/api/suppliers/");
  return response.data;
}

export async function fetchSupplier(id: number): Promise<Supplier> {
  const response = await api.get<Supplier>(`/api/suppliers/${id}/`);
  return response.data;
}

export async function fetchSupplierIngredients(id: number): Promise<Ingredient[]> {
  const response = await api.get<Ingredient[]>(`/api/suppliers/${id}/ingredients/`);
  return response.data;
}
