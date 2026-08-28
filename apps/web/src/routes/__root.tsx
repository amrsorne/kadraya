import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router";
import { api } from "@kadraya/api";
import type { User } from "@kadraya/shared";

export interface RouterContext {
  user: User | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: () => {
    const user = api.auth.getCurrentUser();
    return { user };
  },
  component: () => <Outlet />,
});

export function requireAuth() {
  const user = api.auth.getCurrentUser();
  if (!user) throw redirect({ to: "/login" });
  return { user };
}
