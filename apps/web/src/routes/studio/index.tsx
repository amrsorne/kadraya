import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { api } from "@kadraya/api";
import { AppShell } from "../../components/ui";
import { ms } from "../../lib/ms";
import { useInvalidateKadraya } from "../../lib/queries";
import { requireAuth } from "../__root";

export const Route = createFileRoute("/studio/")({
  beforeLoad: () => requireAuth(),
  component: NewStudioPage,
});

function NewStudioPage() {
  const navigate = useNavigate();
  const invalidate = useInvalidateKadraya();
  const create = useMutation({
    mutationFn: async () => api.kadraya.create(),
    onSuccess: (card) => {
      invalidate();
      void navigate({ to: "/studio/$id", params: { id: card.id } });
    },
  });

  useEffect(() => {
    create.mutate();
  }, []);

  if (create.isError) {
    return (
      <AppShell>
        <p className="text-red-600">{String(create.error)}</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <p>{ms.common.loading}</p>
    </AppShell>
  );
}
