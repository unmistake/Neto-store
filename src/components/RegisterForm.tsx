"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type LocationResponse = {
  ok?: boolean;
  data?: {
    city?: string;
    state?: string;
    country?: string;
  };
};

function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

function formatTaxId(value: string): string {
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

function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{2})(\d)/, "$1 $2")
    .replace(/^(\d{2}) (\d{5})(\d)/, "$1 $2-$3");
}

function formatZip(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    tax_id: "",
    address_street: "",
    address_number: "",
    address_district: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    address_country: "Brasil",
  });

  useEffect(() => {
    let active = true;

    async function loadLocation() {
      try {
        const response = await fetch("/api/location", { cache: "no-store" });
        const payload = (await response.json()) as LocationResponse;
        if (!active || !payload.ok || !payload.data) return;

        setForm((current) => ({
          ...current,
          address_city: current.address_city || payload.data?.city || "",
          address_state: current.address_state || (payload.data?.state || "").slice(0, 2).toUpperCase(),
          address_country: current.address_country || payload.data?.country || "Brasil",
        }));
      } finally {
        if (active) setLocationLoading(false);
      }
    }

    loadLocation();
    return () => {
      active = false;
    };
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function fillAddressByCep(zip: string) {
    const cep = onlyDigits(zip).slice(0, 8);
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data?.erro) return;

      setForm((current) => ({
        ...current,
        address_street: data.logradouro || current.address_street,
        address_district: data.bairro || current.address_district,
        address_city: data.localidade || current.address_city,
        address_state: data.uf || current.address_state,
        address_country: "Brasil",
      }));
    } catch {
      // CEP is a convenience only; manual address still works.
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error || "Nao foi possivel criar sua conta.");
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Nome</span>
          <input
            value={form.first_name}
            onChange={(event) => updateField("first_name", event.target.value)}
            autoComplete="given-name"
            className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Sobrenome</span>
          <input
            value={form.last_name}
            onChange={(event) => updateField("last_name", event.target.value)}
            autoComplete="family-name"
            className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Telefone</span>
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", formatPhone(event.target.value))}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="75 99999-9999"
            className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">CPF/CNPJ</span>
          <input
            value={form.tax_id}
            onChange={(event) => updateField("tax_id", formatTaxId(event.target.value))}
            inputMode="numeric"
            autoComplete="username"
            placeholder="000.000.000-00"
            className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
            required
          />
        </label>
      </div>

      <div className="rounded-[2rem] border border-[color:var(--line)] bg-white/55 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--brand)]">Localizacao</p>
            <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">
              {locationLoading ? "Detectando cidade pelo IP..." : "Preenchida automaticamente quando disponivel. Voce pode ajustar."}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">CEP</span>
            <input
              value={form.address_zip}
              onChange={(event) => {
                const zip = formatZip(event.target.value);
                updateField("address_zip", zip);
                if (onlyDigits(zip).length === 8) fillAddressByCep(zip);
              }}
              onBlur={(event) => fillAddressByCep(event.target.value)}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Numero</span>
            <input
              value={form.address_number}
              onChange={(event) => updateField("address_number", event.target.value)}
              autoComplete="address-line2"
              placeholder="123"
              className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Logradouro</span>
            <input
              value={form.address_street}
              onChange={(event) => updateField("address_street", event.target.value)}
              autoComplete="address-line1"
              placeholder="Rua, avenida..."
              className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Bairro</span>
            <input
              value={form.address_district}
              onChange={(event) => updateField("address_district", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
            />
          </label>

          <div className="grid grid-cols-[1fr_5rem] gap-3">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Cidade</span>
              <input
                value={form.address_city}
                onChange={(event) => updateField("address_city", event.target.value)}
                autoComplete="address-level2"
                className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">UF</span>
              <input
                value={form.address_state}
                onChange={(event) => updateField("address_state", event.target.value.toUpperCase().slice(0, 2))}
                autoComplete="address-level1"
                maxLength={2}
                className="mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-4 text-base font-bold uppercase outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100"
              />
            </label>
          </div>
        </div>
      </div>

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
        {loading ? "Criando conta..." : "Criar minha conta"}
      </button>
    </form>
  );
}
