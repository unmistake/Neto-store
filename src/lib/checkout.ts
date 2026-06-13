import type { StoreProduct } from "@/lib/products";

export type CheckoutCartInput = {
  product_id: number;
  quantity: number;
};

export type ValidatedCheckoutItem = {
  product: StoreProduct;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type CheckoutValidation = {
  ok: boolean;
  items: ValidatedCheckoutItem[];
  subtotal: number;
  issues: string[];
};

export type CheckoutCustomer = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  tax_id: string;
};

export type CheckoutAddress = {
  zip: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

export type CheckoutDeliveryMethod = "delivery" | "pickup";
export type CheckoutPaymentMethod = "pix" | "credit_card" | "store";
