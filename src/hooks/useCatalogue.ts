/**
 * P08 — React access to the catalogue data layer (READ ONLY).
 * Renders local fallback data immediately, then upgrades to Supabase data.
 */
import { useEffect, useState } from "react";
import {
  fetchCatalogue,
  localCatalogue,
  type CatalogueResult,
} from "@/data/catalogueRepository";

export interface UseCatalogueState extends CatalogueResult {
  loading: boolean;
}

export function useCatalogue(): UseCatalogueState {
  const [state, setState] = useState<CatalogueResult>(() => localCatalogue("Initial load pending."));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCatalogue().then((result) => {
      if (!active) return;
      if (result.fallbackReason) {
        // Never hide a backend problem: surface it in the console.
        console.warn("[catalogue] using local fallback —", result.fallbackReason);
      }
      setState(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { ...state, loading };
}
