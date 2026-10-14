import { PAUTAS } from "@/lib/pautas";

export function PautaPills({
  selecionada,
  onSelecionar,
}: {
  selecionada: string;
  onSelecionar: (slug: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" data-pautas-pills="1">
      {PAUTAS.map((p) => {
        const ativa = p.slug === selecionada;
        return (
          <button
            key={p.slug}
            type="button"
            onClick={() => onSelecionar(p.slug)}
            aria-pressed={ativa}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              ativa
                ? "border-verde-mata bg-verde-mata text-white"
                : "border-borda bg-superficie text-corpo hover:border-verde-mata/40 hover:bg-trilha"
            }`}
          >
            {p.rotuloPopular}
          </button>
        );
      })}
    </div>
  );
}
