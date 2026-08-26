import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTr } from "@/lib/i18n";
import {
  assignCustomerToAdmin,
  fetchAdminAccess,
  fetchAdminDashboardSummary,
  grantAdminRoleByEmail,
  hasAdminPermission,
  listAdminCustomers,
  listAdminTeam,
  revokeAdminRole,
  type AdminAccess,
  type AdminCustomer,
  type AdminDashboardSummary,
  type AdminRoleKey,
  type AdminTeamMember,
} from "@/data/adminRepository";

const roleLabels: Record<AdminRoleKey, { fr: string; en: string; de: string }> = {
  super_admin: { fr: "Super Admin", en: "Super Admin", de: "Super Admin" },
  customer_manager: { fr: "Customer Manager", en: "Customer Manager", de: "Customer Manager" },
  customer_admin: { fr: "Customer Admin", en: "Customer Admin", de: "Customer Admin" },
  commerce_admin: { fr: "Commerce Admin", en: "Commerce Admin", de: "Commerce Admin" },
};

const money = (amount: number, currency: string | null) => {
  if (!currency) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  }
};

const AdminDashboardPage = () => {
  const tr = useTr();
  const [access, setAccess] = useState<AdminAccess | null>(null);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [team, setTeam] = useState<AdminTeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRoleKey>("customer_admin");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canManageAdmins = hasAdminPermission(access, "admins.manage");
  const canAssignCustomers = hasAdminPermission(access, "customers.assign");
  const canReadTeam = hasAdminPermission(access, "admins.read");

  const refresh = useCallback(async (searchValue = search) => {
    setError(null);
    const nextAccess = await fetchAdminAccess();
    setAccess(nextAccess);
    const [nextSummary, nextCustomers] = await Promise.all([
      fetchAdminDashboardSummary(),
      listAdminCustomers(searchValue),
    ]);
    setSummary(nextSummary);
    setCustomers(nextCustomers);

    if (nextAccess.permissionKeys.includes("admins.read")) {
      setTeam(await listAdminTeam());
    } else {
      setTeam([]);
    }
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    refresh("")
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Admin dashboard unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refresh]);

  const customerAdmins = useMemo(
    () => team.filter((member) => member.roleKeys.includes("customer_admin")),
    [team],
  );

  const onSearch = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      setCustomers(await listAdminCustomers(search));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setBusy(false);
    }
  };

  const onAddAdmin = async (event: FormEvent) => {
    event.preventDefault();
    if (!canManageAdmins || !adminEmail.trim()) return;
    setBusy(true);
    setActionMessage(null);
    try {
      await grantAdminRoleByEmail(adminEmail, adminRole);
      setAdminEmail("");
      await refresh();
      setActionMessage(tr({ fr: "Rôle administrateur attribué.", en: "Administrator role granted.", de: "Administratorrolle vergeben." }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role assignment failed.");
    } finally {
      setBusy(false);
    }
  };

  const onAssignCustomer = async (event: FormEvent) => {
    event.preventDefault();
    if (!canAssignCustomers || !selectedCustomer || !selectedAdmin) return;
    setBusy(true);
    setActionMessage(null);
    try {
      await assignCustomerToAdmin(selectedCustomer, selectedAdmin, true);
      await refresh();
      setActionMessage(tr({ fr: "Client attribué au Customer Admin.", en: "Customer assigned to Customer Admin.", de: "Kunde dem Customer Admin zugewiesen." }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Customer assignment failed.");
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async (member: AdminTeamMember, role: AdminRoleKey) => {
    if (!canManageAdmins || busy) return;
    setBusy(true);
    setActionMessage(null);
    try {
      await revokeAdminRole(member.adminUserId, role);
      await refresh();
      setActionMessage(tr({ fr: "Rôle retiré.", en: "Role removed.", de: "Rolle entfernt." }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role removal failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 space-y-8">
          <div>
            <p className="text-sm font-semibold text-primary">Customer & Commerce</p>
            <h1 className="text-3xl font-heading font-bold mt-1">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              {tr({
                fr: "Gestion des comptes clients, commandes, paiements et équipe administrateur.",
                en: "Manage customer accounts, orders, payments and the administrator team.",
                de: "Verwaltung von Kundenkonten, Bestellungen, Zahlungen und Administrator-Team.",
              })}
            </p>
          </div>

          {loading ? (
            <p aria-busy="true">{tr({ fr: "Chargement…", en: "Loading…", de: "Wird geladen…" })}</p>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">{error}</div>
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{tr({ fr: "Clients visibles", en: "Visible customers", de: "Sichtbare Kunden" })}</p><p className="text-3xl font-bold mt-2">{summary?.visibleCustomers ?? 0}</p></div>
                <div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{tr({ fr: "Clients ayant payé", en: "Customers who paid", de: "Zahlende Kunden" })}</p><p className="text-3xl font-bold mt-2">{summary?.customersWithPaidOrders ?? 0}</p></div>
                <div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{tr({ fr: "Commandes payées", en: "Paid orders", de: "Bezahlte Bestellungen" })}</p><p className="text-3xl font-bold mt-2">{summary?.paidOrders ?? 0}</p></div>
                <div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{tr({ fr: "Commandes en attente", en: "Pending orders", de: "Offene Bestellungen" })}</p><p className="text-3xl font-bold mt-2">{summary?.pendingOrders ?? 0}</p></div>
              </section>

              <section className="rounded-2xl border bg-card p-5">
                <h2 className="text-xl font-heading font-semibold">{tr({ fr: "Revenus confirmés", en: "Confirmed revenue", de: "Bestätigter Umsatz" })}</h2>
                <div className="flex flex-wrap gap-3 mt-3">
                  {Object.entries(summary?.revenueByCurrency ?? {}).length === 0 ? <span className="text-sm text-muted-foreground">—</span> : Object.entries(summary?.revenueByCurrency ?? {}).map(([currency, amount]) => <span key={currency} className="rounded-full border px-3 py-1 text-sm font-semibold">{money(amount, currency)}</span>)}
                </div>
              </section>

              <section className="rounded-2xl border bg-card p-5 overflow-x-auto">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div><h2 className="text-xl font-heading font-semibold">{tr({ fr: "Comptes clients", en: "Customer accounts", de: "Kundenkonten" })}</h2><p className="text-sm text-muted-foreground">{tr({ fr: "Les Customer Admins ne voient que leurs clients attribués.", en: "Customer Admins only see assigned customers.", de: "Customer Admins sehen nur ihre zugewiesenen Kunden." })}</p></div>
                  <form onSubmit={onSearch} className="flex gap-2"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr({ fr: "Nom ou e-mail", en: "Name or email", de: "Name oder E-Mail" })} /><Button type="submit" variant="outline" disabled={busy}>{tr({ fr: "Rechercher", en: "Search", de: "Suchen" })}</Button></form>
                </div>
                <table className="w-full min-w-[900px] mt-5 text-sm">
                  <thead><tr className="border-b text-left"><th className="py-3 pr-4">Client</th><th className="py-3 pr-4">Compte</th><th className="py-3 pr-4">Commandes</th><th className="py-3 pr-4">Payées</th><th className="py-3 pr-4">Total payé</th><th className="py-3">Admin principal</th></tr></thead>
                  <tbody>{customers.map((customer) => <tr key={customer.userId} className="border-b last:border-0"><td className="py-3 pr-4"><div className="font-medium">{customer.displayName || "—"}</div><div className="text-muted-foreground">{customer.email}</div></td><td className="py-3 pr-4">{new Date(customer.accountCreatedAt).toLocaleDateString()}</td><td className="py-3 pr-4">{customer.orderCount}</td><td className="py-3 pr-4">{customer.paidOrderCount}</td><td className="py-3 pr-4">{money(customer.totalPaidAmount, customer.paidCurrency)}</td><td className="py-3">{team.find((member) => member.adminUserId === customer.primaryAdminId)?.displayName || team.find((member) => member.adminUserId === customer.primaryAdminId)?.email || "—"}</td></tr>)}</tbody>
                </table>
              </section>

              {canAssignCustomers && (
                <section className="rounded-2xl border bg-card p-5">
                  <h2 className="text-xl font-heading font-semibold">{tr({ fr: "Répartition des clients — Super Admin", en: "Customer assignment — Super Admin", de: "Kundenzuweisung — Super Admin" })}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{tr({ fr: "Seul le Super Admin peut attribuer ou réattribuer un client.", en: "Only the Super Admin can assign or reassign a customer.", de: "Nur der Super Admin kann Kunden zuweisen oder neu zuweisen." })}</p>
                  <form onSubmit={onAssignCustomer} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] mt-4">
                    <select className="h-10 rounded-md border bg-background px-3" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}><option value="">{tr({ fr: "Choisir un client", en: "Choose a customer", de: "Kunden wählen" })}</option>{customers.map((customer) => <option key={customer.userId} value={customer.userId}>{customer.displayName || customer.email}</option>)}</select>
                    <select className="h-10 rounded-md border bg-background px-3" value={selectedAdmin} onChange={(e) => setSelectedAdmin(e.target.value)}><option value="">{tr({ fr: "Choisir un Customer Admin", en: "Choose a Customer Admin", de: "Customer Admin wählen" })}</option>{customerAdmins.map((member) => <option key={member.adminUserId} value={member.adminUserId}>{member.displayName || member.email} ({member.assignedCustomerCount})</option>)}</select>
                    <Button type="submit" disabled={busy || !selectedCustomer || !selectedAdmin}>{tr({ fr: "Attribuer", en: "Assign", de: "Zuweisen" })}</Button>
                  </form>
                </section>
              )}

              {canReadTeam && (
                <section className="rounded-2xl border bg-card p-5">
                  <h2 className="text-xl font-heading font-semibold">{tr({ fr: "Équipe administrateur", en: "Administrator team", de: "Administrator-Team" })}</h2>
                  {canManageAdmins && <form onSubmit={onAddAdmin} className="grid gap-3 md:grid-cols-[1fr_240px_auto] mt-4"><div><Label htmlFor="admin-email">E-mail</Label><Input id="admin-email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@example.com" /></div><div><Label htmlFor="admin-role">{tr({ fr: "Rôle", en: "Role", de: "Rolle" })}</Label><select id="admin-role" className="h-10 w-full rounded-md border bg-background px-3" value={adminRole} onChange={(e) => setAdminRole(e.target.value as AdminRoleKey)}><option value="customer_admin">Customer Admin</option><option value="commerce_admin">Commerce Admin</option><option value="customer_manager">Customer Manager</option><option value="super_admin">Super Admin</option></select></div><Button className="self-end" type="submit" disabled={busy || !adminEmail.trim()}>{tr({ fr: "Ajouter", en: "Add", de: "Hinzufügen" })}</Button></form>}
                  <div className="mt-5 space-y-3">{team.map((member) => <div key={member.adminUserId} className="rounded-xl border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-semibold">{member.displayName || member.email}</div><div className="text-sm text-muted-foreground">{member.email} · {member.assignedCustomerCount} {tr({ fr: "clients", en: "customers", de: "Kunden" })}</div><div className="flex flex-wrap gap-2 mt-2">{member.roleKeys.map((role) => <span key={role} className="rounded-full bg-muted px-2.5 py-1 text-xs">{tr(roleLabels[role])}</span>)}</div></div>{canManageAdmins && <div className="flex flex-wrap gap-2">{member.roleKeys.filter((role) => role !== "super_admin" || team.filter((item) => item.roleKeys.includes("super_admin")).length > 1).map((role) => <Button key={role} size="sm" variant="outline" disabled={busy} onClick={() => void onRevoke(member, role)}>{tr({ fr: "Retirer", en: "Remove", de: "Entfernen" })} {tr(roleLabels[role])}</Button>)}</div>}</div>)}</div>
                </section>
              )}

              <section className="rounded-2xl border bg-card p-5">
                <h2 className="text-xl font-heading font-semibold">{tr({ fr: "Modules commerce", en: "Commerce modules", de: "Commerce-Module" })}</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border p-4"><div className="font-semibold">Entitlements</div><div className="text-sm text-muted-foreground mt-1">{summary?.entitlementModuleActive ? "Actif" : tr({ fr: "Sera activé avec M10", en: "Will activate with M10", de: "Wird mit M10 aktiviert" })}</div></div><div className="rounded-xl border p-4"><div className="font-semibold">Subscriptions</div><div className="text-sm text-muted-foreground mt-1">{summary?.subscriptionModuleActive ? "Actif" : tr({ fr: "Prévu pour la phase abonnement", en: "Planned for subscription phase", de: "Für die Abonnementphase vorgesehen" })}</div></div></div>
              </section>

              {actionMessage && <p role="status" className="text-sm font-semibold text-primary">{actionMessage}</p>}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboardPage;
