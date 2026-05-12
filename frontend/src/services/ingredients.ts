import type { Ingredient } from "../types";
import api from "./api";

export async function fetchIngredients(): Promise<Ingredient[]> {
  const response = await api.get<Ingredient[]>("/api/ingredients/");
  return response.data;
}
