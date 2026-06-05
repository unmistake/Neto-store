"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { StoreProduct } from "@/lib/products";

type Props = {
  product: StoreProduct;
};

export function VisualizeWheelButton({ product }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => Boolean(file && !loading), [file, loading]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setResult(null);
    setError(null);

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  async function generate() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append("productId", String(product.id));
    form.append("carImage", file);

    try {
      const response = await fetch("/api/visualize-wheel", {
        method: "POST",
        body: form,
      });
      const payload = (await response.json()) as { ok: boolean; image?: string; error?: string };
      if (!response.ok || !payload.ok || !payload.image) {
        throw new Error(payload.error || "Nao foi possivel gerar a visualizacao.");
      }
      setResult(payload.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar visualizacao.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-[color:var(--brand)] bg-white px-5 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-[color:var(--brand)] transition hover:bg-orange-50"
      >
        Visualizar no meu carro
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
          <div className="mx-auto my-6 max-w-5xl rounded-[2rem] bg-[color:var(--paper)] p-5 shadow-2xl md:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--brand)]">Simulador com IA</p>
                <h2 className="display-font mt-1 text-3xl font-black">Visualizar no meu carro</h2>
                <p className="mt-2 text-sm text-[color:var(--muted)]">Envie uma foto lateral ou 3/4 do carro. A IA vai aplicar a roda escolhida mantendo o cenário original.</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full bg-white px-4 py-2 text-sm font-black">Fechar</button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-4 rounded-[1.5rem] border border-[color:var(--line)] bg-white/70 p-4">
                <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-stone-200">
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">Roda escolhida</p>
                  <h3 className="display-font mt-1 text-2xl font-black">{product.name}</h3>
                </div>
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">Foto do seu carro</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="w-full rounded-2xl border border-[color:var(--line)] bg-white p-3 text-sm" />
                </label>
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={generate}
                  className="w-full rounded-2xl bg-[color:var(--brand)] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[color:var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Gerando visualizacao..." : "Gerar visualizacao"}
                </button>
                {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/60 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">Foto enviada</p>
                  <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-stone-200">
                    {preview ? <Image src={preview} alt="Foto do carro" fill className="object-cover" unoptimized /> : <div className="flex h-full items-center justify-center p-8 text-center text-sm font-bold text-[color:var(--muted)]">A foto do carro aparece aqui</div>}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/60 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">Resultado IA</p>
                  <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-stone-200">
                    {result ? <Image src={result} alt="Resultado da visualizacao" fill className="object-cover" unoptimized /> : <div className="flex h-full items-center justify-center p-8 text-center text-sm font-bold text-[color:var(--muted)]">O resultado gerado aparece aqui</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
