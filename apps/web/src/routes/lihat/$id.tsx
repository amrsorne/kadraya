import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Button } from "../../components/ui";
import { KadrayaPreview } from "../../components/KadrayaPreview";
import { ms } from "../../lib/ms";
import { useKadraya } from "../../lib/queries";
import { requireAuth } from "../__root";

export const Route = createFileRoute("/lihat/$id")({
  beforeLoad: () => requireAuth(),
  component: ViewPage,
});

function ViewPage() {
  const { id } = Route.useParams();
  const { data: kadraya, isLoading, error } = useKadraya(id);

  if (isLoading) return <AppShell><p>{ms.common.loading}</p></AppShell>;
  if (error || !kadraya) {
    return (
      <AppShell>
        <p className="text-red-600">{error ? String(error) : "Kad tidak dijumpai"}</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-raya-green">{ms.card.view}</h1>
        <Link to="/">
          <Button variant="ghost">{ms.common.back}</Button>
        </Link>
      </div>
      <KadrayaPreview kadraya={kadraya} />
    </AppShell>
  );
}
