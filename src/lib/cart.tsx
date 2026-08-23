/**
 * P13 — Shopping cart / PURCHASE INTENT (frontend only).
 *
 * TRUST MODEL:
 * The cart is NOT an authoritative commerce source. It persists ONLY programme
 * identifiers. Prices, titles, currency and totals are always derived from the
 * catalogue layer at render time and are DISPLAY VALUES ONLY. A future trusted
 * server-side checkout will recompute the authoritative amount.
 *
 * The cart never reads or writes orders, order_items, profiles or any Supabase
 * table. It performs no database writes at all.
 */
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export const CART_STORAGE_KEY = "bill-care:cart:v1";

export type CartContextValue = {
  /** Unique programme identifiers, in insertion order. Purchase intent only. */
  itemIds: number[];
  /** Number of unique programmes (quantity is always 1 per programme). */
  itemCount: number;
  has: (programmeId: number) => boolean;
  addProgramme: (programmeId: number) => void;
  removeProgramme: (programmeId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const isValidId = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

/** Never crashes: any malformed storage payload resolves to an empty cart. */
export function readStoredCart(raw: string | null): number[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: number[] = [];
  for (const entry of parsed) {
    if (!isValidId(entry)) continue;
    if (out.includes(entry)) continue;
    out.push(entry);
  }
  return out;
}

function loadFromStorage(): number[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    return readStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    return [];
  }
}

function persist(ids: number[]) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable (private mode / quota) — cart stays in memory only */
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [itemIds, setItemIds] = useState<number[]>(loadFromStorage);

  useEffect(() => {
    persist(itemIds);
  }, [itemIds]);

  const addProgramme = useCallback((programmeId: number) => {
    if (!isValidId(programmeId)) return;
    // One programme = one cart item. Never quantity 2.
    setItemIds((prev) => (prev.includes(programmeId) ? prev : [...prev, programmeId]));
  }, []);

  const removeProgramme = useCallback((programmeId: number) => {
    setItemIds((prev) => prev.filter((id) => id !== programmeId));
  }, []);

  const clearCart = useCallback(() => setItemIds([]), []);

  const has = useCallback((programmeId: number) => itemIds.includes(programmeId), [itemIds]);

  return (
    <CartContext.Provider
      value={{ itemIds, itemCount: itemIds.length, has, addProgramme, removeProgramme, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
