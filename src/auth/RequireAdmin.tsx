import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { fetchAdminAccess, type AdminAccess } from "@/data/adminRepository";
import { useTr } from "@/lib/i18n";

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const tr = useTr();
  const [access, setAccess] = useState<AdminAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchAdminAccess()
      .then((next) => {
        if (active) setAccess(next);
      })
      .catch(() => {
        if (active) setAccess({ isAdmin: false, roleKeys: [], permissionKeys: [] });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-busy="true">
        <p className="text-sm font-body text-muted-foreground">
          {tr({ fr: "Vérification des droits administrateur…", en: "Checking administrator access…", de: "Administratorrechte werden geprüft…" })}
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!access?.isAdmin) return <Navigate to="/account" replace />;

  return <>{children}</>;
};

export default RequireAdmin;
