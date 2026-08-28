import {
  type Db,
  type Kadraya,
  type User,
  dbSchema,
  createEmptyKadraya,
  SEED_USERS,
} from "@kadraya/shared";

export const DB_KEY = "kadraya:v1";
export const SESSION_KEY = "kadraya:session";

function createId(): string {
  return crypto.randomUUID();
}

function createToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

function emptyDb(): Db {
  return { users: [], kadraya: [], deliveries: [], shareTokens: [] };
}

export function readDb(): Db {
  if (typeof localStorage === "undefined") return emptyDb();
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return seedDb();
  try {
    return dbSchema.parse(JSON.parse(raw));
  } catch {
    return seedDb();
  }
}

export function writeDb(db: Db): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function seedDb(): Db {
  const now = new Date().toISOString();
  const db: Db = {
    users: SEED_USERS.map((u) => ({
      id: createId(),
      username: u.username,
      displayName: u.displayName,
      createdAt: now,
    })),
    kadraya: [],
    deliveries: [],
    shareTokens: [],
  };
  writeDb(db);
  return db;
}

export function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionUserId(userId: string | null): void {
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "VALIDATION" | "CONFLICT",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function requireUser(): User {
  const userId = getSessionUserId();
  if (!userId) throw new ApiError("Sila log masuk.", "UNAUTHORIZED");
  const user = readDb().users.find((u) => u.id === userId);
  if (!user) {
    setSessionUserId(null);
    throw new ApiError("Sesi tamat. Sila log masuk semula.", "UNAUTHORIZED");
  }
  return user;
}

export const auth = {
  getCurrentUser(): User | null {
    const userId = getSessionUserId();
    if (!userId) return null;
    return readDb().users.find((u) => u.id === userId) ?? null;
  },

  login(username: string, _password: string): User {
    const db = readDb();
    const user = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new ApiError("Pengguna tidak dijumpai.", "NOT_FOUND");
    setSessionUserId(user.id);
    return user;
  },

  register(username: string, displayName: string, _password: string): User {
    const db = readDb();
    const normalized = username.trim().toLowerCase();
    if (!normalized) throw new ApiError("Nama pengguna diperlukan.", "VALIDATION");
    if (db.users.some((u) => u.username.toLowerCase() === normalized)) {
      throw new ApiError("Nama pengguna sudah wujud.", "CONFLICT");
    }
    const user: User = {
      id: createId(),
      username: normalized,
      displayName: displayName.trim() || normalized,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDb(db);
    setSessionUserId(user.id);
    return user;
  },

  logout(): void {
    setSessionUserId(null);
  },

  listUsers(): User[] {
    requireUser();
    return readDb().users;
  },
};

export const kadraya = {
  create(): Kadraya {
    const user = requireUser();
    const db = readDb();
    const card = createEmptyKadraya(user.id, createId());
    db.kadraya.push(card);
    writeDb(db);
    return card;
  },

  update(id: string, patch: Partial<Omit<Kadraya, "id" | "ownerId" | "schemaVersion" | "createdAt">>): Kadraya {
    const user = requireUser();
    const db = readDb();
    const index = db.kadraya.findIndex((k) => k.id === id);
    if (index === -1) throw new ApiError("Kad tidak dijumpai.", "NOT_FOUND");
    const existing = db.kadraya[index];
    if (existing.ownerId !== user.id) throw new ApiError("Tiada kebenaran.", "FORBIDDEN");
    if (existing.status === "sent") throw new ApiError("Kad yang dihantar tidak boleh diedit.", "FORBIDDEN");
    const updated: Kadraya = {
      ...existing,
      ...patch,
      id: existing.id,
      ownerId: existing.ownerId,
      schemaVersion: existing.schemaVersion,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    db.kadraya[index] = updated;
    writeDb(db);
    return updated;
  },

  delete(id: string): void {
    const user = requireUser();
    const db = readDb();
    const card = db.kadraya.find((k) => k.id === id);
    if (!card) throw new ApiError("Kad tidak dijumpai.", "NOT_FOUND");
    if (card.ownerId !== user.id) throw new ApiError("Tiada kebenaran.", "FORBIDDEN");
    if (card.status === "sent") throw new ApiError("Kad yang dihantar tidak boleh dipadam.", "FORBIDDEN");
    db.kadraya = db.kadraya.filter((k) => k.id !== id);
    writeDb(db);
  },

  getById(id: string): Kadraya {
    requireUser();
    const card = readDb().kadraya.find((k) => k.id === id);
    if (!card) throw new ApiError("Kad tidak dijumpai.", "NOT_FOUND");
    return card;
  },

  getByIdPublic(id: string): Kadraya {
    const card = readDb().kadraya.find((k) => k.id === id);
    if (!card) throw new ApiError("Kad tidak dijumpai.", "NOT_FOUND");
    return card;
  },

  listDrafts(): Kadraya[] {
    const user = requireUser();
    return readDb()
      .kadraya.filter((k) => k.ownerId === user.id && k.status === "draft")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  listSent(): Kadraya[] {
    const user = requireUser();
    return readDb()
      .kadraya.filter((k) => k.ownerId === user.id && k.status === "sent")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  listInbox(): Array<{ deliveryId: string; kadraya: Kadraya; sentAt: string; readAt: string | null; sender: User }> {
    const user = requireUser();
    const db = readDb();
    return db.deliveries
      .filter((d) => d.recipientUserId === user.id)
      .map((d) => {
        const card = db.kadraya.find((k) => k.id === d.kadrayaId);
        const sender = db.users.find((u) => u.id === d.senderId);
        if (!card || !sender) return null;
        return { deliveryId: d.id, kadraya: card, sentAt: d.sentAt, readAt: d.readAt, sender };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  },

  markRead(deliveryId: string): void {
    const user = requireUser();
    const db = readDb();
    const delivery = db.deliveries.find((d) => d.id === deliveryId && d.recipientUserId === user.id);
    if (!delivery) throw new ApiError("Penghantaran tidak dijumpai.", "NOT_FOUND");
    delivery.readAt = new Date().toISOString();
    writeDb(db);
  },

  send(id: string, recipientUserId?: string): { shareToken: string; shareUrl: string } {
    const user = requireUser();
    const db = readDb();
    const index = db.kadraya.findIndex((k) => k.id === id);
    if (index === -1) throw new ApiError("Kad tidak dijumpai.", "NOT_FOUND");
    const card = db.kadraya[index];
    if (card.ownerId !== user.id) throw new ApiError("Tiada kebenaran.", "FORBIDDEN");

    const sentCard: Kadraya = {
      ...card,
      status: "sent",
      updatedAt: new Date().toISOString(),
    };
    db.kadraya[index] = sentCard;

    if (recipientUserId) {
      const recipient = db.users.find((u) => u.id === recipientUserId);
      if (!recipient) throw new ApiError("Penerima tidak dijumpai.", "NOT_FOUND");
      if (recipient.id === user.id) throw new ApiError("Tidak boleh hantar kepada diri sendiri.", "VALIDATION");
      db.deliveries.push({
        id: createId(),
        senderId: user.id,
        recipientUserId: recipient.id,
        kadrayaId: sentCard.id,
        sentAt: new Date().toISOString(),
        readAt: null,
      });
    }

    const token = createToken();
    db.shareTokens.push({
      token,
      kadrayaId: sentCard.id,
      createdAt: new Date().toISOString(),
    });
    writeDb(db);

    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/k/${token}`;
    return { shareToken: token, shareUrl };
  },

  getByShareToken(token: string): Kadraya {
    const db = readDb();
    const link = db.shareTokens.find((t) => t.token === token);
    if (!link) throw new ApiError("Pautan tidak sah atau tamat tempoh.", "NOT_FOUND");
    const card = db.kadraya.find((k) => k.id === link.kadrayaId);
    if (!card) throw new ApiError("Kad tidak dijumpai.", "NOT_FOUND");
    return card;
  },

  getDashboardStats(): { drafts: number; sent: number; inbox: number; unread: number } {
    const user = requireUser();
    const db = readDb();
    const drafts = db.kadraya.filter((k) => k.ownerId === user.id && k.status === "draft").length;
    const sent = db.kadraya.filter((k) => k.ownerId === user.id && k.status === "sent").length;
    const inboxDeliveries = db.deliveries.filter((d) => d.recipientUserId === user.id);
    const inbox = inboxDeliveries.length;
    const unread = inboxDeliveries.filter((d) => !d.readAt).length;
    return { drafts, sent, inbox, unread };
  },
};

export const api = { auth, kadraya };
