import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { api } from "@kadraya/api";
import { AppShell, EmptyState } from "../components/ui";
import { KadrayaListItem } from "../components/KadrayaPreview";
import { ms } from "../lib/ms";
import { useInbox, useInvalidateKadraya } from "../lib/queries";
import { requireAuth } from "./__root";

export const Route = createFileRoute("/peti-masuk")({
  beforeLoad: () => requireAuth(),
  component: InboxPage,
});

function InboxPage() {
  const { data: inbox = [], isLoading } = useInbox();
  const invalidate = useInvalidateKadraya();
  const markRead = useMutation({
    mutationFn: async (deliveryId: string) => {
      api.kadraya.markRead(deliveryId);
    },
    onSuccess: () => invalidate(),
  });

  return (
    <AppShell>
      <h1 className="mb-6 font-display text-3xl font-bold text-raya-green">{ms.nav.inbox}</h1>
      {isLoading ? (
        <p>{ms.common.loading}</p>
      ) : inbox.length === 0 ? (
        <EmptyState message={ms.dashboard.emptyInbox} />
      ) : (
        <div className="space-y-3">
          {inbox.map((item) => (
            <div
              key={item.deliveryId}
              onClick={() => {
                if (!item.readAt) markRead.mutate(item.deliveryId);
              }}
            >
              <KadrayaListItem
                kadraya={item.kadraya}
                meta={`${ms.card.from} ${item.sender.displayName} · ${new Date(item.sentAt).toLocaleDateString("ms-MY")}${!item.readAt ? " · Baru" : ""}`}
                to={`/lihat/${item.kadraya.id}`}
              />
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
