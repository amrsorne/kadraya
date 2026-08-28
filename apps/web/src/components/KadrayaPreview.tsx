import { Link } from "@tanstack/react-router";
import type { Kadraya, StickerType, TemplateId } from "@kadraya/shared";

function KetupatPattern({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-15" aria-hidden>
      <defs>
        <pattern id="ketupat" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke={color} strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ketupat)" />
    </svg>
  );
}

function SongketPattern({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden>
      <defs>
        <pattern id="songket" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 12h24M12 0v24" stroke={color} strokeWidth="0.5" />
          <circle cx="12" cy="12" r="2" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#songket)" />
    </svg>
  );
}

function TemplateDecor({ templateId, accent }: { templateId: TemplateId; accent: string }) {
  switch (templateId) {
    case "ketupat":
      return <KetupatPattern color={accent} />;
    case "tanglung":
      return (
        <>
          <div className="absolute left-4 top-4 h-16 w-12 rounded-b-full border-2 opacity-40" style={{ borderColor: accent, background: `${accent}33` }} />
          <div className="absolute right-8 top-6 h-20 w-14 rounded-b-full border-2 opacity-30" style={{ borderColor: accent, background: `${accent}22` }} />
        </>
      );
    case "bulan-bintang":
      return (
        <>
          <div className="absolute right-6 top-6 h-16 w-16 rounded-full opacity-30" style={{ background: accent }} />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rotate-45 opacity-40"
              style={{ background: accent, top: `${20 + i * 12}%`, left: `${10 + i * 15}%` }}
            />
          ))}
        </>
      );
    case "masjid":
      return (
        <svg className="absolute bottom-0 left-0 right-0 opacity-20" viewBox="0 0 400 120" aria-hidden>
          <path d="M0 120 V80 L50 60 L100 80 V120 M100 120 V70 L150 40 L200 70 V120 M200 120 V75 L250 50 L300 75 V120 M300 120 V85 L350 65 L400 85 V120" fill={accent} />
          <circle cx="200" cy="25" r="12" fill={accent} />
        </svg>
      );
    case "bunga":
      return (
        <>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute h-10 w-10 rounded-full opacity-25"
              style={{ background: accent, top: `${15 + i * 18}%`, right: `${8 + i * 10}%` }}
            />
          ))}
        </>
      );
    case "songket":
      return <SongketPattern color={accent} />;
    default:
      return null;
  }
}

export function StickerSvg({ type, className }: { type: StickerType; className?: string }) {
  const props = { className, viewBox: "0 0 64 64", fill: "currentColor" as const };
  switch (type) {
    case "ketupat":
      return (
        <svg {...props}>
          <path d="M32 4 L60 32 L32 60 L4 32 Z" fill="#D4AF37" stroke="#1B5E20" strokeWidth="2" />
          <path d="M32 4 L32 60 M4 32 L60 32" stroke="#1B5E20" strokeWidth="1" />
        </svg>
      );
    case "tanglung":
      return (
        <svg {...props}>
          <rect x="20" y="8" width="24" height="4" fill="#8B4513" />
          <ellipse cx="32" cy="36" rx="22" ry="24" fill="#E53935" stroke="#FFD700" strokeWidth="2" />
          <line x1="32" y1="12" x2="32" y2="60" stroke="#FFD700" strokeWidth="1" />
        </svg>
      );
    case "bulan":
      return (
        <svg {...props}>
          <path d="M40 8 A28 28 0 1 0 40 56 A20 20 0 1 1 40 8" fill="#FFD54F" />
        </svg>
      );
    case "bintang":
      return (
        <svg {...props}>
          <polygon points="32,4 39,26 62,26 43,40 50,62 32,48 14,62 21,40 2,26 25,26" fill="#FFD700" />
        </svg>
      );
    case "bunga":
      return (
        <svg {...props}>
          {[0, 72, 144, 216, 288].map((rot) => (
            <ellipse key={rot} cx="32" cy="18" rx="10" ry="16" fill="#E91E63" transform={`rotate(${rot} 32 32)`} />
          ))}
          <circle cx="32" cy="32" r="8" fill="#FFD54F" />
        </svg>
      );
    default:
      return null;
  }
}

interface KadrayaPreviewProps {
  kadraya: Kadraya;
  interactive?: boolean;
  selectedStickerId?: string | null;
  onStickerMove?: (id: string, x: number, y: number) => void;
  onStickerSelect?: (id: string | null) => void;
}

export function KadrayaPreview({
  kadraya,
  interactive = false,
  selectedStickerId,
  onStickerMove,
  onStickerSelect,
}: KadrayaPreviewProps) {
  const { palette, templateId, letter, photo, stickers } = kadraya;

  return (
    <div
      className="card-shadow relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl"
      style={{ background: palette.background, color: palette.primary }}
    >
      {photo?.placement === "background" && (
        <img src={photo.dataUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      )}
      <TemplateDecor templateId={templateId} accent={palette.accent} />
      <div className="relative flex h-full flex-col p-6 md:p-8">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 h-1 w-16 rounded-full" style={{ background: palette.accent }} />
          <h2 className="font-display text-xl font-bold md:text-2xl">{letter.tajuk || "Selamat Hari Raya"}</h2>
        </div>

        {photo?.placement === "frame" && (
          <div className="mx-auto mb-4 w-32 overflow-hidden rounded-xl border-4 shadow-lg" style={{ borderColor: palette.accent }}>
            <img src={photo.dataUrl} alt="" className="aspect-square w-full object-cover" />
          </div>
        )}

        <div className="flex-1 space-y-3 text-sm leading-relaxed md:text-base">
          {letter.sapaan && <p className="font-semibold">{letter.sapaan}</p>}
          <p className="whitespace-pre-wrap opacity-90">{letter.isi}</p>
        </div>

        <div className="mt-4 border-t pt-4 text-right">
          <p className="text-sm font-semibold" style={{ color: palette.accent }}>
            {letter.namaPengirim || "—"}
          </p>
        </div>
      </div>

      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className={`absolute cursor-move select-none ${selectedStickerId === sticker.id ? "ring-2 ring-raya-gold ring-offset-2" : ""}`}
          style={{
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            width: `${48 * sticker.scale}px`,
            height: `${48 * sticker.scale}px`,
            transform: "translate(-50%, -50%)",
          }}
          onPointerDown={(e) => {
            if (!interactive) return;
            e.preventDefault();
            onStickerSelect?.(sticker.id);
            const target = e.currentTarget;
            const container = target.offsetParent as HTMLElement;
            const move = (ev: PointerEvent) => {
              const rect = container.getBoundingClientRect();
              const x = ((ev.clientX - rect.left) / rect.width) * 100;
              const y = ((ev.clientY - rect.top) / rect.height) * 100;
              onStickerMove?.(sticker.id, Math.min(95, Math.max(5, x)), Math.min(95, Math.max(5, y)));
            };
            const up = () => {
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
          }}
        >
          <StickerSvg type={sticker.type} className="h-full w-full drop-shadow-md" />
        </div>
      ))}
    </div>
  );
}

export function KadrayaListItem({
  kadraya,
  meta,
  to,
}: {
  kadraya: Kadraya;
  meta?: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="card-shadow flex items-center gap-4 rounded-xl bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div
        className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
        style={{ background: kadraya.palette.background, color: kadraya.palette.primary }}
      >
        Kad
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{kadraya.letter.tajuk || "Tanpa tajuk"}</p>
        <p className="truncate text-sm text-raya-dark/60">{kadraya.letter.isi.slice(0, 60) || "—"}</p>
        {meta && <p className="mt-1 text-xs text-raya-dark/50">{meta}</p>}
      </div>
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${kadraya.status === "draft" ? "bg-gray-100 text-gray-600" : "bg-raya-green/10 text-raya-green"}`}
      >
        {kadraya.status === "draft" ? "Draf" : "Dihantar"}
      </span>
    </Link>
  );
}
