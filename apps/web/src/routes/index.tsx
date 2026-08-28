import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AppShell, StatCard, Button } from "../components/ui";
import { ms } from "../lib/ms";
import { useDashboardStats, useCurrentUser } from "../lib/queries";
import { requireAuth } from "./__root";

export const Route = createFileRoute("/")({
  beforeLoad: () => requireAuth(),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return (
      <AppShell>
        <p>{ms.common.loading}</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-raya-green">{ms.dashboard.title}</h1>
          <p className="mt-1 text-raya-dark/70">
            {ms.dashboard.greeting}, {user?.displayName}!
          </p>
        </div>
        <Link to="/studio">
          <Button variant="secondary">{ms.dashboard.createNew}</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={ms.dashboard.drafts} value={stats.drafts} />
        <StatCard label={ms.dashboard.sent} value={stats.sent} />
        <StatCard label={ms.dashboard.inbox} value={stats.inbox} accent={stats.unread > 0} />
        <StatCard label={ms.dashboard.unread} value={stats.unread} />
      </div>
    </AppShell>
  );
}
