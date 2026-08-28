import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@kadraya/api";
import type { Kadraya } from "@kadraya/shared";

export const queryKeys = {
  user: ["user"] as const,
  users: ["users"] as const,
  stats: ["stats"] as const,
  drafts: ["drafts"] as const,
  sent: ["sent"] as const,
  inbox: ["inbox"] as const,
  kadraya: (id: string) => ["kadraya", id] as const,
  share: (token: string) => ["share", token] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => api.auth.getCurrentUser(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => api.kadraya.getDashboardStats(),
  });
}

export function useDrafts() {
  return useQuery({
    queryKey: queryKeys.drafts,
    queryFn: () => api.kadraya.listDrafts(),
  });
}

export function useSent() {
  return useQuery({
    queryKey: queryKeys.sent,
    queryFn: () => api.kadraya.listSent(),
  });
}

export function useInbox() {
  return useQuery({
    queryKey: queryKeys.inbox,
    queryFn: () => api.kadraya.listInbox(),
  });
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => api.auth.listUsers(),
  });
}

export function useKadraya(id: string) {
  return useQuery({
    queryKey: queryKeys.kadraya(id),
    queryFn: () => api.kadraya.getById(id),
    enabled: !!id,
  });
}

export function useShareKadraya(token: string) {
  return useQuery({
    queryKey: queryKeys.share(token),
    queryFn: () => api.kadraya.getByShareToken(token),
    enabled: !!token,
    retry: false,
  });
}

export function useInvalidateKadraya() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.drafts });
    void qc.invalidateQueries({ queryKey: queryKeys.sent });
    void qc.invalidateQueries({ queryKey: queryKeys.inbox });
    void qc.invalidateQueries({ queryKey: queryKeys.stats });
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ralat tidak diketahui";
}

export type KadrayaPatch = Partial<Omit<Kadraya, "id" | "ownerId" | "schemaVersion" | "createdAt">>;
