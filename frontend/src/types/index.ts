export interface Supplier {
  id: number;
  name: string;
  description: string;
  created_at: string;
  ingredient_count: number;
}

export interface Ingredient {
  id: number;
  supplier_id: number;
  supplier_name: string;
  name: string;
  description: string;
  unit: string;
  price_per_unit: string;
}

export interface BuyerProfile {
  id: number;
  company_name: string;
  username: string;
  email: string;
  total_orders: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  ingredient: Ingredient;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  created_at: string;
  item_count: number;
  total_amount: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  updated_at: string;
}

export interface ProductIngredient {
  ingredient: Ingredient;
  quantity: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  ingredient_count: number;
  created_at: string;
}

export interface ProductDetail extends Product {
  ingredients: ProductIngredient[];
  updated_at: string;
}
