"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

function formatIdentifier(value: string): string {
  if (value.includes("@")) {
    return value.trim();
  }

  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error || "Nao foi possivel entrar com esses dados.");
        return;
      }

      router.push("/minha-conta");
      router.refresh();
    } catch {
      setError("Falha de conexao. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">E-mail ou CPF/CNPJ</span>
        <input
          value={identifier}
          onChange={(event) => setIdentifier(formatIdentifier(event.target.value))}
          autoComplete="username"
          placeholder="cliente@email.com ou 000.000.000-00"
          className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
          required
        />
      </label>

      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Senha</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="Sua senha"
          className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
          required
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[color:var(--brand)] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[color:var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar na minha conta"}
      </button>
    </form>
  );
}
