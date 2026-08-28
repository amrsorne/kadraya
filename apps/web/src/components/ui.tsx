import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@kadraya/api";
import { ms } from "../lib/ms";
import { queryKeys } from "../lib/queries";

const navItems = [
  { to: "/" as const, label: ms.nav.home },
  { to: "/draf" as const, label: ms.nav.drafts },
  { to: "/dihantar" as const, label: ms.nav.sent },
  { to: "/peti-masuk" as const, label: ms.nav.inbox },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const logout = useMutation({
    mutationFn: async () => {
      api.auth.logout();
    },
    onSuccess: () => {
      qc.setQueryData(queryKeys.user, null);
      window.location.href = "/login";
    },
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-raya-gold/20 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="font-display text-2xl font-bold text-raya-green">
            {ms.appName}
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-raya-dark/80 hover:bg-raya-green/10 hover:text-raya-green [&.active]:bg-raya-green [&.active]:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/studio"
              className="rounded-lg bg-raya-gold px-4 py-2 text-sm font-semibold text-raya-dark hover:bg-raya-gold/90"
            >
              + {ms.nav.studio}
            </Link>
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="rounded-lg border border-raya-green/20 px-3 py-2 text-sm text-raya-green hover:bg-raya-green/5"
            >
              {ms.nav.logout}
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-raya-gold/10 px-4 py-2 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-raya-dark/80 [&.active]:bg-raya-green [&.active]:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-raya-green">{ms.appName}</h1>
          <p className="mt-2 text-raya-dark/70">{ms.tagline}</p>
        </div>
        <div className="card-shadow rounded-2xl bg-white p-8">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`card-shadow rounded-2xl p-6 ${accent ? "bg-raya-green text-white" : "bg-white"}`}>
      <p className={`text-sm ${accent ? "text-white/80" : "text-raya-dark/60"}`}>{label}</p>
      <p className="mt-2 font-display text-4xl font-bold">{value}</p>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card-shadow rounded-2xl bg-white p-12 text-center text-raya-dark/60">
      <p>{message}</p>
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary: "bg-raya-green text-white hover:bg-raya-green/90",
    secondary: "bg-raya-gold text-raya-dark hover:bg-raya-gold/90",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "border border-raya-green/20 text-raya-green hover:bg-raya-green/5",
  };
  return (
    <button
      type="button"
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-raya-dark/80">{label}</span>
      <input
        className="w-full rounded-lg border border-raya-green/20 bg-white px-3 py-2 outline-none focus:border-raya-green focus:ring-2 focus:ring-raya-green/20"
        {...props}
      />
    </label>
  );
}

export function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-raya-dark/80">{label}</span>
      <textarea
        className="w-full rounded-lg border border-raya-green/20 bg-white px-3 py-2 outline-none focus:border-raya-green focus:ring-2 focus:ring-raya-green/20"
        {...props}
      />
    </label>
  );
}
