import { Landmark, Users } from "lucide-react";
import type { CargoFiltro } from "@/lib/parlamentares";

/**
 * Filtro rápido por cargo (abas de alternância no topo da lista):
 * `Todos (594)` · `Deputados Federais (513)` · `Senadores (81)`.
 * As contagens vêm do dataset (nunca fixas no código).
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
    <div className="flex flex-wrap gap-2" aria-label="Filtrar por cargo">
      {abas.map((aba) => {
        const ativa = selecionado === aba.valor;
        const Icone = aba.valor === "SENADOR" ? Landmark : Users;
        return (
          <button
            key={aba.valor}
            type="button"
            onClick={() => onSelecionar(aba.valor)}
            aria-current={ativa ? "true" : undefined}
            data-cargo-tab={aba.valor}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
              ativa
                ? "border-dourado bg-dourado/15 text-titulo"
                : "border-borda bg-superficie text-corpo hover:border-dourado/50"
            }`}
          >
            <Icone className="h-3.5 w-3.5" aria-hidden />
            {aba.rotulo} ({contagens[aba.valor]}){extra?.[aba.valor] ?? ""}
          </button>
        );
      })}
    </div>
  );
}
