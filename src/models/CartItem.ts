import { Product } from "~/models/Product";

export type CartItem = {
  product: Product;
  count: number;
};

export type CartItemBE = {
  count: number;
  productId: string;
  product: Product;
};

export type CartItemToSave = {
  count: number;
  product: {
    id: string;
  };
};
