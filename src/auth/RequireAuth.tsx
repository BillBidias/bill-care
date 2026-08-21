/**
 * P11 — UX-only route protection.
 *
 * This is NOT authorization: database RLS remains the actual security boundary.
 * It only avoids rendering an authenticated screen to a signed-out visitor.
 */
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/auth/useAuth";
import { useTr } from "@/lib/i18n";

/** Only known internal paths may be used as a post-login return target. */
const SAFE_RETURN_PATHS = new Set(["/account"]);

export function safeReturnPath(pathname: string): string | null {
  return SAFE_RETURN_PATHS.has(pathname) ? pathname : null;
}

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const tr = useTr();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-busy="true">
        <p className="text-sm font-body text-muted-foreground">
          {tr({ fr: "Chargement…", en: "Loading…", de: "Wird geladen…" })}
        </p>
      </div>
    );
  }

  if (!user) {
    const from = safeReturnPath(location.pathname);
    return <Navigate to={from ? `/login?from=${encodeURIComponent(from)}` : "/login"} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
