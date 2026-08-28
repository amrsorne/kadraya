import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@kadraya/api";
import { AuthShell, Button, Input } from "../components/ui";
import { ms } from "../lib/ms";
import { getErrorMessage, queryKeys } from "../lib/queries";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (api.auth.getCurrentUser()) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

function LoginPage() {
  const qc = useQueryClient();
  const login = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) =>
      api.auth.login(username, password),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.user, user);
      window.location.href = "/";
    },
  });

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      login.mutate(value);
    },
  });

  return (
    <AuthShell>
      <h2 className="font-display text-2xl font-bold text-raya-green">{ms.auth.login}</h2>
      <p className="mt-1 text-sm text-raya-dark/60">{ms.auth.loginSubtitle}</p>
      <p className="mt-3 rounded-lg bg-raya-cream px-3 py-2 text-xs text-raya-dark/70">{ms.auth.demoHint}</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="username">
          {(field) => (
            <Input
              label={ms.auth.username}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              autoComplete="username"
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <Input
              label={ms.auth.password}
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              autoComplete="current-password"
            />
          )}
        </form.Field>
        {login.error && (
          <p className="text-sm text-red-600">{getErrorMessage(login.error)}</p>
        )}
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {ms.auth.login}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-raya-dark/70">
        {ms.auth.noAccount}{" "}
        <Link to="/daftar" className="font-semibold text-raya-green hover:underline">
          {ms.auth.register}
        </Link>
      </p>
    </AuthShell>
  );
}
