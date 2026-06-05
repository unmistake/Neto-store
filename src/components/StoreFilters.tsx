import { ProductFilters } from "@/lib/products";

function SelectFilter({ label, name, value, options }: { label: string; name: string; value?: string; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</span>
      <select name={name} defaultValue={value || ""} className="w-full rounded-2xl border border-[color:var(--line)] bg-white/75 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[color:var(--brand)]">
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function StoreFilters({ filters, params }: { filters: ProductFilters; params: Record<string, string | undefined> }) {
  return (
    <form className="rounded-[2rem] border border-[color:var(--line)] bg-white/60 p-4 shadow-xl shadow-stone-900/5 backdrop-blur md:p-5">
      <div className="grid gap-3 md:grid-cols-6">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">Buscar</span>
          <input name="q" defaultValue={params.q || ""} placeholder="Ex: 195/55, Civic, aro 17..." className="w-full rounded-2xl border border-[color:var(--line)] bg-white/75 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[color:var(--brand)]" />
        </label>
        <SelectFilter label="Categoria" name="category" value={params.category} options={["pneu", "roda"]} />
        <SelectFilter label="Marca" name="brand" value={params.brand} options={filters.brands} />
        <SelectFilter label="Aro" name="rim" value={params.rim} options={filters.rims} />
        <SelectFilter label="Carro" name="car" value={params.car} options={filters.cars} />
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button className="rounded-2xl bg-[color:var(--night)] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-black">Filtrar</button>
        <a href="/" className="rounded-2xl border border-[color:var(--line)] px-6 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-[color:var(--ink)] transition hover:bg-white">Limpar</a>
      </div>
    </form>
  );
}
