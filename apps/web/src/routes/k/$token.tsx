import { createFileRoute } from "@tanstack/react-router";
import { KadrayaPreview } from "../../components/KadrayaPreview";
import { ms } from "../../lib/ms";
import { useShareKadraya } from "../../lib/queries";

export const Route = createFileRoute("/k/$token")({
  component: SharePage,
});

function SharePage() {
  const { token } = Route.useParams();
  const { data: kadraya, isLoading, isError } = useShareKadraya(token);

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-display text-3xl font-bold text-raya-green">{ms.share.title}</h1>
        <p className="mt-2 text-sm text-raya-dark/60">{ms.share.hint}</p>
      </div>
      <div className="mx-auto mt-8 max-w-md">
        {isLoading ? (
          <p className="text-center">{ms.common.loading}</p>
        ) : isError || !kadraya ? (
          <p className="card-shadow rounded-xl bg-white p-8 text-center text-red-600">{ms.share.notFound}</p>
        ) : (
          <KadrayaPreview kadraya={kadraya} />
        )}
      </div>
    </div>
  );
}
