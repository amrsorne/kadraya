import { z } from "zod";

export const TEMPLATE_IDS = [
  "ketupat",
  "tanglung",
  "bulan-bintang",
  "masjid",
  "bunga",
  "songket",
] as const;

export const STICKER_TYPES = [
  "ketupat",
  "tanglung",
  "bulan",
  "bintang",
  "bunga",
] as const;

export const PALETTE_PRESETS = [
  { id: "emas-hijau", label: "Emas & Hijau", primary: "#1B5E20", accent: "#D4AF37", background: "#FFF8E7" },
  { id: "hijau-krim", label: "Hijau & Krim", primary: "#2E7D32", accent: "#8BC34A", background: "#FAF3E0" },
  { id: "emas-merah", label: "Emas & Merah", primary: "#B71C1C", accent: "#FFD700", background: "#FFF5F5" },
  { id: "biru-emas", label: "Biru Malam & Emas", primary: "#0D47A1", accent: "#FFD54F", background: "#E3F2FD" },
] as const;

export const templateIdSchema = z.enum(TEMPLATE_IDS);
export const stickerTypeSchema = z.enum(STICKER_TYPES);

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string(),
  createdAt: z.string(),
});

export const paletteSchema = z.object({
  primary: z.string(),
  accent: z.string(),
  background: z.string(),
});

export const letterSchema = z.object({
  tajuk: z.string(),
  sapaan: z.string(),
  isi: z.string(),
  namaPengirim: z.string(),
});

export const photoSchema = z.object({
  dataUrl: z.string(),
  placement: z.enum(["background", "frame"]),
});

export const stickerPlacementSchema = z.object({
  id: z.string(),
  type: stickerTypeSchema,
  x: z.number(),
  y: z.number(),
  scale: z.number().min(0.3).max(3),
});

export const kadrayaSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  ownerId: z.string(),
  status: z.enum(["draft", "sent"]),
  templateId: templateIdSchema,
  palette: paletteSchema,
  letter: letterSchema,
  photo: photoSchema.optional(),
  stickers: z.array(stickerPlacementSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const deliverySchema = z.object({
  id: z.string(),
  senderId: z.string(),
  recipientUserId: z.string(),
  kadrayaId: z.string(),
  sentAt: z.string(),
  readAt: z.string().nullable(),
});

export const shareTokenSchema = z.object({
  token: z.string(),
  kadrayaId: z.string(),
  createdAt: z.string(),
});

export const dbSchema = z.object({
  users: z.array(userSchema),
  kadraya: z.array(kadrayaSchema),
  deliveries: z.array(deliverySchema),
  shareTokens: z.array(shareTokenSchema),
});

export type TemplateId = z.infer<typeof templateIdSchema>;
export type StickerType = z.infer<typeof stickerTypeSchema>;
export type User = z.infer<typeof userSchema>;
export type Palette = z.infer<typeof paletteSchema>;
export type Letter = z.infer<typeof letterSchema>;
export type Photo = z.infer<typeof photoSchema>;
export type StickerPlacement = z.infer<typeof stickerPlacementSchema>;
export type Kadraya = z.infer<typeof kadrayaSchema>;
export type Delivery = z.infer<typeof deliverySchema>;
export type ShareToken = z.infer<typeof shareTokenSchema>;
export type Db = z.infer<typeof dbSchema>;

export const DEFAULT_PALETTE: Palette = {
  primary: PALETTE_PRESETS[0].primary,
  accent: PALETTE_PRESETS[0].accent,
  background: PALETTE_PRESETS[0].background,
};

export const DEFAULT_LETTER: Letter = {
  tajuk: "Selamat Hari Raya Aidilfitri",
  sapaan: "Assalamualaikum,",
  isi: "Di pagi mulia ini, kami ingin mengucapkan Selamat Hari Raya. Maaf zahir dan batin.",
  namaPengirim: "",
};

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  ketupat: "Ketupat",
  tanglung: "Tanglung",
  "bulan-bintang": "Bulan & Bintang",
  masjid: "Masjid Siluet",
  bunga: "Bunga Raya",
  songket: "Songket",
};

export const STICKER_LABELS: Record<StickerType, string> = {
  ketupat: "Ketupat",
  tanglung: "Tanglung",
  bulan: "Bulan",
  bintang: "Bintang",
  bunga: "Bunga",
};

export const SEED_USERS = [
  { username: "aminah", displayName: "Aminah" },
  { username: "faizal", displayName: "Faizal" },
  { username: "siti", displayName: "Siti" },
] as const;

export function createEmptyKadraya(ownerId: string, id: string): Kadraya {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    id,
    ownerId,
    status: "draft",
    templateId: "ketupat",
    palette: { ...DEFAULT_PALETTE },
    letter: { ...DEFAULT_LETTER },
    stickers: [],
    createdAt: now,
    updatedAt: now,
  };
}
