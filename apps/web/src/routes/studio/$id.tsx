import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../../components/ui";
import { StudioEditor } from "../../components/StudioEditor";
import { ms } from "../../lib/ms";
import { useKadraya } from "../../lib/queries";
import { requireAuth } from "../__root";

export const Route = createFileRoute("/studio/$id")({
  beforeLoad: () => requireAuth(),
  component: EditStudioPage,
});

function EditStudioPage() {
  const { id } = Route.useParams();
  const { data: kadraya, isLoading, error } = useKadraya(id);

  if (isLoading) {
    return (
      <AppShell>
        <p>{ms.common.loading}</p>
      </AppShell>
    );
  }

  if (error || !kadraya) {
    return (
      <AppShell>
        <p className="text-red-600">{error ? String(error) : "Kad tidak dijumpai"}</p>
      </AppShell>
    );
  }

  if (kadraya.status === "sent") {
    return (
      <AppShell>
        <p>Kad ini sudah dihantar dan tidak boleh diedit.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="mb-6 font-display text-3xl font-bold text-raya-green">{ms.studio.editTitle}</h1>
      <StudioEditor initial={kadraya} />
    </AppShell>
  );
}
