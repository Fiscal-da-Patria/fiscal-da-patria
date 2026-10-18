import { ArrowUpDown, ChevronDown, MapPin, Search } from "lucide-react";
import { ROTULOS_ORDEM, UFS, type Ordem } from "@/lib/parlamentares";

export function BuscaFiltros({
  busca,
  uf,
  ordem,
  rotulos = ROTULOS_ORDEM,
  onBusca,
  onUf,
  onOrdem,
}: {
  busca: string;
  uf: string;
  ordem: Ordem;
  /** Rótulos pauta-aware (o app passa `rotulosOrdem(pauta)`). */
  rotulos?: Record<Ordem, string>;
  onBusca: (v: string) => void;
  onUf: (v: string) => void;
  onOrdem: (v: Ordem) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <div className="relative min-w-[13rem] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-corpo-fraco" />
        <input
          type="search"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          aria-label="Buscar parlamentar por nome, partido ou estado"
          placeholder="Buscar por nome, partido ou estado…"
          className="w-full rounded-xl border border-borda bg-superficie py-2.5 pl-9 pr-3 text-sm text-titulo shadow-sm outline-none transition focus:border-dourado focus:ring-2 focus:ring-dourado/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
        />
      </div>
      <div className="relative w-full sm:w-40">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-corpo-fraco" />
        <select
          value={uf}
          onChange={(e) => onUf(e.target.value)}
          aria-label="Filtrar por estado"
          className="w-full appearance-none rounded-xl border border-borda bg-superficie py-2.5 pl-9 pr-8 text-sm font-medium text-titulo shadow-sm outline-none transition focus:border-dourado focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
        >
          {UFS.map((u) => (
            <option key={u} value={u}>
              {u === "TODOS" ? "Todos os estados" : u}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-corpo-fraco"
          aria-hidden
        />
      </div>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <span className="hidden shrink-0 text-[11px] font-bold uppercase tracking-wider text-corpo sm:inline">
          Ordenar por:
        </span>
        <div className="relative w-full sm:w-64">
          <ArrowUpDown className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-corpo-fraco" />
          <select
            value={ordem}
            onChange={(e) => onOrdem(e.target.value as Ordem)}
            aria-label="Ordenar a lista"
            className="w-full appearance-none rounded-xl border border-borda bg-superficie py-2.5 pl-9 pr-8 text-sm font-medium text-titulo shadow-sm outline-none transition focus:border-dourado focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
          >
            {(Object.keys(rotulos) as Ordem[]).map((o) => (
              <option key={o} value={o}>
                {rotulos[o]}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-corpo-fraco"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

