import { createFileRoute } from "@tanstack/react-router";
import { AppShell, EmptyState } from "../components/ui";
import { KadrayaListItem } from "../components/KadrayaPreview";
import { ms } from "../lib/ms";
import { useSent } from "../lib/queries";
import { requireAuth } from "./__root";

export const Route = createFileRoute("/dihantar")({
  beforeLoad: () => requireAuth(),
  component: SentPage,
});

function SentPage() {
  const { data: sent = [], isLoading } = useSent();

  return (
    <AppShell>
      <h1 className="mb-6 font-display text-3xl font-bold text-raya-green">{ms.nav.sent}</h1>
      {isLoading ? (
        <p>{ms.common.loading}</p>
      ) : sent.length === 0 ? (
        <EmptyState message={ms.dashboard.emptySent} />
      ) : (
        <div className="space-y-3">
          {sent.map((k) => (
            <KadrayaListItem key={k.id} kadraya={k} to={`/lihat/${k.id}`} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
