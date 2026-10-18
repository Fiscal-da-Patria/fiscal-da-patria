import { Landmark, Users } from "lucide-react";
import type { CargoFiltro } from "@/lib/parlamentares";

/**
 * Filtro rápido por cargo (abas de alternância no topo da lista).
 * No celular vira um segmented control de 3 colunas, com a contagem em uma
 * segunda linha; no desktop mantém as pills arredondadas.
 */
export function CargoTabs({
  selecionado,
  contagens,
  extra,
  onSelecionar,
}: {
  selecionado: CargoFiltro;
  contagens: Record<CargoFiltro, number>;
  /** Sufixo por aba, ex.: `" · 73 votaram"` (quantos têm voto na matéria ativa). */
  extra?: Partial<Record<CargoFiltro, string>>;
  onSelecionar: (c: CargoFiltro) => void;
}) {
  const abas: Array<{ valor: CargoFiltro; rotulo: string }> = [
    { valor: "TODOS", rotulo: "Todos" },
    { valor: "DEPUTADO", rotulo: "Deputados Federais" },
    { valor: "SENADOR", rotulo: "Senadores" },
  ];

  return (
    <div
      role="group"
      aria-label="Filtrar por cargo"
      className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2"
    >
      {abas.map((aba) => {
        const ativa = selecionado === aba.valor;
        const Icone = aba.valor === "SENADOR" ? Landmark : Users;
        return (
          <button
            key={aba.valor}
            type="button"
            onClick={() => onSelecionar(aba.valor)}
            aria-pressed={ativa}
            data-cargo-tab={aba.valor}
            className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border px-1.5 py-1.5 text-xs font-bold transition sm:inline-flex sm:flex-row sm:gap-1.5 sm:rounded-full sm:px-3.5 sm:py-1.5 ${
              ativa
                ? "border-dourado bg-dourado/15 text-titulo"
                : "border-borda bg-superficie text-corpo hover:border-dourado/50"
            }`}
          >
            <Icone className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="flex min-w-0 flex-col items-center leading-tight sm:flex-row sm:items-baseline sm:gap-1">
              <span className="text-center sm:whitespace-nowrap">{aba.rotulo}</span>
              <span className="text-center font-mono text-[11px] font-semibold text-corpo">
                ({contagens[aba.valor]}){extra?.[aba.valor] ?? ""}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}