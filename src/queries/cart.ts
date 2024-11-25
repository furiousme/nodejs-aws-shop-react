import axios, { AxiosError } from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { CartItem, CartItemBE, CartItemToSave } from "~/models/CartItem";

export function useCart() {
  console.log({ API_PATHS });
  return useQuery<CartItemBE[], AxiosError>("cart", async () => {
    const res = await axios.get<{ data: { items: CartItemBE[] } }>(
      `${API_PATHS.bff}/cart`,
      {
        headers: {
          Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        },
      }
    );
    return res.data.data.items;
  });
}

export function useCartData() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<CartItem[]>("cart");
}

export function useInvalidateCart() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("cart", { exact: true }),
    []
  );
}

export function useUpsertCart() {
  return useMutation((values: CartItemToSave) =>
    axios.put<CartItemToSave[]>(`${API_PATHS.bff}/cart`, values, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}
