import { PAUTAS } from "@/lib/pautas";

/** Rótulos curtos para o celular; o nome acessível continua completo. */
const ROTULOS_CURTOS: Record<string, string> = {
  cesta_basica: "Comida sem imposto",
  igualdade_salarial: "Salário igual",
  fim_blindagem: "Fim da blindagem",
  ir_isento: "Salário livre de IR",
  super_ricos: "Super-ricos",
  teto_juro_cartao: "Teto do cartão",
  piso_enfermagem: "Piso da enfermagem",
  fim_escala_6x1: "Fim da escala 6x1",
  aposentadoria_agentes_saude: "Agentes de saúde",
  crime_organizado: "Crime organizado",
  preco_energia: "Combustíveis",
};

export function PautaPills({
  selecionada,
  onSelecionar,
}: {
  selecionada: string;
  onSelecionar: (slug: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Escolher pauta"
      className="flex flex-wrap gap-1.5 sm:gap-2"
      data-pautas-pills="1"
    >
      {PAUTAS.map((p) => {
        const ativa = p.slug === selecionada;
        return (
          <button
            key={p.slug}
            type="button"
            onClick={() => onSelecionar(p.slug)}
            aria-pressed={ativa}
            aria-label={p.rotuloPopular}
            title={p.rotuloPopular}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold transition sm:px-3.5 sm:py-1.5 sm:text-xs ${
              ativa
                ? "border-verde-mata bg-verde-mata text-white"
                : "border-borda bg-superficie text-corpo hover:border-verde-mata/40 hover:bg-trilha"
            }`}
          >
            {ROTULOS_CURTOS[p.slug] ?? p.rotuloPopular}
          </button>
        );
      })}
    </div>
  );
}
