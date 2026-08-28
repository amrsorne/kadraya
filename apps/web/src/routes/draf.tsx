import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, EmptyState, Button } from "../components/ui";
import { KadrayaListItem } from "../components/KadrayaPreview";
import { ms } from "../lib/ms";
import { useDrafts } from "../lib/queries";
import { requireAuth } from "./__root";

export const Route = createFileRoute("/draf")({
  beforeLoad: () => requireAuth(),
  component: DraftsPage,
});

function DraftsPage() {
  const { data: drafts = [], isLoading } = useDrafts();

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-raya-green">{ms.nav.drafts}</h1>
        <Link to="/studio">
          <Button variant="secondary">{ms.dashboard.createNew}</Button>
        </Link>
      </div>
      {isLoading ? (
        <p>{ms.common.loading}</p>
      ) : drafts.length === 0 ? (
        <EmptyState message={ms.dashboard.emptyDrafts} />
      ) : (
        <div className="space-y-3">
          {drafts.map((k) => (
            <KadrayaListItem key={k.id} kadraya={k} to={`/studio/${k.id}`} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
