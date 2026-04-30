import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CatalogProduct } from "@/lib/catalog";

type WishlistState = {
  items: CatalogProduct[];
  toggleItem: (product: CatalogProduct) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) => {
        const { items } = get();
        const exists = items.some((item) => item.id === product.id);
        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearWishlist: () => set({ items: [] }),
      isInWishlist: (id) => get().items.some((item) => item.id === id),
    }),
    {
      name: "studio-catalog-wishlist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
