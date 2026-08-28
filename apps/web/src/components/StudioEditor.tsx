import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@kadraya/api";
import {
  TEMPLATE_IDS,
  STICKER_TYPES,
  PALETTE_PRESETS,
  TEMPLATE_LABELS,
  STICKER_LABELS,
  type Kadraya,
  type StickerType,
  type TemplateId,
} from "@kadraya/shared";
import { KadrayaPreview, StickerSvg } from "./KadrayaPreview";
import { Button, Textarea, Input } from "./ui";
import { ms } from "../lib/ms";
import { compressPhoto } from "../lib/photo";
import { getErrorMessage, queryKeys, useInvalidateKadraya, useUsers } from "../lib/queries";

interface StudioEditorProps {
  initial: Kadraya;
}

export function StudioEditor({ initial }: StudioEditorProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const invalidate = useInvalidateKadraya();
  const { data: users = [] } = useUsers();
  const [kadraya, setKadraya] = useState(initial);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [showSend, setShowSend] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => api.kadraya.update(kadraya.id, kadraya),
    onSuccess: (updated) => {
      setKadraya(updated);
      invalidate();
      void qc.invalidateQueries({ queryKey: queryKeys.kadraya(kadraya.id) });
      setSavedMsg(ms.studio.saved);
      setTimeout(() => setSavedMsg(""), 2000);
    },
    onError: (e) => setError(getErrorMessage(e)),
  });

  const sendMutation = useMutation({
    mutationFn: async () => api.kadraya.send(kadraya.id, recipientId || undefined),
    onSuccess: (result) => {
      invalidate();
      setShareUrl(result.shareUrl);
      setShowSend(true);
    },
    onError: (e) => setError(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      api.kadraya.delete(kadraya.id);
    },
    onSuccess: () => {
      invalidate();
      void navigate({ to: "/draf" });
    },
    onError: (e) => setError(getErrorMessage(e)),
  });

  const update = (patch: Partial<Kadraya>) => setKadraya((k) => ({ ...k, ...patch }));

  const addSticker = (type: StickerType) => {
    const id = crypto.randomUUID();
    update({
      stickers: [...kadraya.stickers, { id, type, x: 50, y: 50, scale: 1 }],
    });
    setSelectedStickerId(id);
  };

  const moveSticker = (id: string, x: number, y: number) => {
    update({
      stickers: kadraya.stickers.map((s) => (s.id === id ? { ...s, x, y } : s)),
    });
  };

  const scaleSticker = (delta: number) => {
    if (!selectedStickerId) return;
    update({
      stickers: kadraya.stickers.map((s) =>
        s.id === selectedStickerId ? { ...s, scale: Math.min(3, Math.max(0.3, s.scale + delta)) } : s,
      ),
    });
  };

  const removeSticker = () => {
    if (!selectedStickerId) return;
    update({ stickers: kadraya.stickers.filter((s) => s.id !== selectedStickerId) });
    setSelectedStickerId(null);
  };

  const handlePhoto = async (file: File) => {
    try {
      const { dataUrl } = await compressPhoto(file);
      update({ photo: { dataUrl, placement: kadraya.photo?.placement ?? "frame" } });
      setError("");
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const currentUser = api.auth.getCurrentUser();
  const otherUsers = users.filter((u) => u.id !== currentUser?.id);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <p className="mb-4 text-sm font-medium text-raya-dark/60">{ms.studio.preview}</p>
        <KadrayaPreview
          kadraya={kadraya}
          interactive
          selectedStickerId={selectedStickerId}
          onStickerMove={moveSticker}
          onStickerSelect={setSelectedStickerId}
        />
      </div>

      <div className="space-y-6">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {savedMsg && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{savedMsg}</p>}

        <section className="card-shadow rounded-xl bg-white p-4">
          <h3 className="mb-3 font-semibold">{ms.studio.template}</h3>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => update({ templateId: id })}
                className={`rounded-lg border px-3 py-2 text-sm ${kadraya.templateId === id ? "border-raya-green bg-raya-green/10 font-semibold text-raya-green" : "border-gray-200"}`}
              >
                {TEMPLATE_LABELS[id as TemplateId]}
              </button>
            ))}
          </div>
        </section>

        <section className="card-shadow rounded-xl bg-white p-4">
          <h3 className="mb-3 font-semibold">{ms.studio.palette}</h3>
          <div className="space-y-2">
            {PALETTE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => update({ palette: { primary: p.primary, accent: p.accent, background: p.background } })}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm hover:border-raya-green"
              >
                <span className="flex gap-1">
                  <span className="h-5 w-5 rounded-full" style={{ background: p.primary }} />
                  <span className="h-5 w-5 rounded-full" style={{ background: p.accent }} />
                  <span className="h-5 w-5 rounded-full border" style={{ background: p.background }} />
                </span>
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <section className="card-shadow space-y-3 rounded-xl bg-white p-4">
          <h3 className="font-semibold">{ms.studio.letter}</h3>
          <Input
            label={ms.studio.tajuk}
            value={kadraya.letter.tajuk}
            onChange={(e) => update({ letter: { ...kadraya.letter, tajuk: e.target.value } })}
          />
          <Input
            label={ms.studio.sapaan}
            value={kadraya.letter.sapaan}
            onChange={(e) => update({ letter: { ...kadraya.letter, sapaan: e.target.value } })}
          />
          <Textarea
            label={ms.studio.isi}
            rows={4}
            value={kadraya.letter.isi}
            onChange={(e) => update({ letter: { ...kadraya.letter, isi: e.target.value } })}
          />
          <Input
            label={ms.studio.namaPengirim}
            value={kadraya.letter.namaPengirim}
            onChange={(e) => update({ letter: { ...kadraya.letter, namaPengirim: e.target.value } })}
          />
        </section>

        <section className="card-shadow rounded-xl bg-white p-4">
          <h3 className="mb-3 font-semibold">{ms.studio.photo}</h3>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-lg bg-raya-green px-3 py-2 text-sm font-semibold text-white hover:bg-raya-green/90">
              {ms.studio.addPhoto}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handlePhoto(file);
                }}
              />
            </label>
            {kadraya.photo && (
              <>
                <Button variant="ghost" onClick={() => update({ photo: { ...kadraya.photo!, placement: "background" } })}>
                  {ms.studio.placementBackground}
                </Button>
                <Button variant="ghost" onClick={() => update({ photo: { ...kadraya.photo!, placement: "frame" } })}>
                  {ms.studio.placementFrame}
                </Button>
                <Button variant="danger" onClick={() => update({ photo: undefined })}>
                  {ms.studio.removePhoto}
                </Button>
              </>
            )}
          </div>
        </section>

        <section className="card-shadow rounded-xl bg-white p-4">
          <h3 className="mb-3 font-semibold">{ms.studio.stickers}</h3>
          <div className="mb-3 flex flex-wrap gap-2">
            {STICKER_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addSticker(type)}
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 hover:border-raya-gold"
                title={STICKER_LABELS[type]}
              >
                <StickerSvg type={type} className="h-8 w-8" />
              </button>
            ))}
          </div>
          {selectedStickerId && (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => scaleSticker(0.1)}>+</Button>
              <Button variant="ghost" onClick={() => scaleSticker(-0.1)}>-</Button>
              <Button variant="danger" onClick={removeSticker}>Buang</Button>
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {ms.studio.saveDraft}
          </Button>
          <Button variant="secondary" onClick={() => setShowSend(true)}>
            {ms.studio.send}
          </Button>
          <Button variant="danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            {ms.studio.delete}
          </Button>
        </div>
      </div>

      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card-shadow w-full max-w-md rounded-2xl bg-white p-6">
            {!shareUrl ? (
              <>
                <h3 className="font-display text-xl font-bold">{ms.studio.send}</h3>
                <p className="mt-2 text-sm text-raya-dark/70">{ms.studio.recipient}</p>
                <select
                  className="mt-3 w-full rounded-lg border border-raya-green/20 px-3 py-2"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                >
                  <option value="">{ms.studio.skipRecipient}</option>
                  {otherUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName} (@{u.username})
                    </option>
                  ))}
                </select>
                <div className="mt-6 flex gap-2">
                  <Button
                    onClick={() => {
                      saveMutation.mutate(undefined, {
                        onSuccess: () => sendMutation.mutate(),
                      });
                    }}
                    disabled={sendMutation.isPending}
                  >
                    {ms.studio.send}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowSend(false)}>
                    {ms.common.cancel}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-display text-xl font-bold text-raya-green">{ms.studio.sendSuccess}</h3>
                <p className="mt-2 break-all rounded-lg bg-raya-cream p-3 text-sm">{shareUrl}</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => {
                      void navigator.clipboard.writeText(shareUrl);
                    }}
                  >
                    {ms.studio.copyLink}
                  </Button>
                  <Button variant="ghost" onClick={() => void navigate({ to: "/dihantar" })}>
                    {ms.common.back}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
