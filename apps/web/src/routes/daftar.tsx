import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@kadraya/api";
import { AuthShell, Button, Input } from "../components/ui";
import { ms } from "../lib/ms";
import { getErrorMessage, queryKeys } from "../lib/queries";

export const Route = createFileRoute("/daftar")({
  beforeLoad: () => {
    if (api.auth.getCurrentUser()) throw redirect({ to: "/" });
  },
  component: RegisterPage,
});

function RegisterPage() {
  const qc = useQueryClient();
  const register = useMutation({
    mutationFn: async ({
      username,
      displayName,
      password,
    }: {
      username: string;
      displayName: string;
      password: string;
    }) => api.auth.register(username, displayName, password),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.user, user);
      window.location.href = "/";
    },
  });

  const form = useForm({
    defaultValues: { username: "", displayName: "", password: "" },
    onSubmit: async ({ value }) => {
      register.mutate(value);
    },
  });

  return (
    <AuthShell>
      <h2 className="font-display text-2xl font-bold text-raya-green">{ms.auth.register}</h2>
      <p className="mt-1 text-sm text-raya-dark/60">{ms.auth.registerSubtitle}</p>

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
        <form.Field name="displayName">
          {(field) => (
            <Input
              label={ms.auth.displayName}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
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
              autoComplete="new-password"
            />
          )}
        </form.Field>
        {register.error && (
          <p className="text-sm text-red-600">{getErrorMessage(register.error)}</p>
        )}
        <Button type="submit" className="w-full" disabled={register.isPending}>
          {ms.auth.register}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-raya-dark/70">
        {ms.auth.hasAccount}{" "}
        <Link to="/login" className="font-semibold text-raya-green hover:underline">
          {ms.auth.login}
        </Link>
      </p>
    </AuthShell>
  );
}
