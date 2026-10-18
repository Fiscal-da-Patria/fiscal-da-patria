import { memo } from "react";
import { COR_GRAFICO, rotuloAlinhamento } from "@/lib/parlamentares";
import { ORDEM_VOTOS } from "@/lib/partidos";
import type { AlinhamentoVoto } from "@/types/parlamentar";

const RADII = [90, 82, 74, 66, 58, 50, 42, 34, 26];

/**
 * Mini-hemiciclo: assentos em semicírculo, coloridos pela PROPORÇÃO de votos da
 * pauta selecionada, considerando os parlamentares do filtro atual
 * (Câmara + Senado = Congresso Nacional).
 *
 * O número de assentos é a **soma real da distribuição** — nunca uma constante.
 * Assim, filtrar “Senadores” desenha 81 assentos, e uma casa sem votação nominal
 * mostra os assentos como `Sem voto individual`, sem inventar “Ausente”.
 */
export const Hemiciclo = memo(function Hemiciclo({
  distribuicao,
  rotulo = "Congresso Nacional",
  pautaSlug,
}: {
  distribuicao: Record<AlinhamentoVoto, number>;
  rotulo?: string;
  pautaSlug?: string;
}) {
  const total = ORDEM_VOTOS.reduce((s, k) => s + distribuicao[k], 0);

  const somaR = RADII.reduce((a, b) => a + b, 0);
  const counts = RADII.map((r) => Math.round((total * r) / somaR));
  counts[0] += total - counts.reduce((a, b) => a + b, 0);

  const lista: AlinhamentoVoto[] = [];
  for (const k of ORDEM_VOTOS) {
    for (let i = 0; i < distribuicao[k]; i++) lista.push(k);
  }

  const assentos: Array<{ x: number; y: number; a: AlinhamentoVoto }> = [];
  let idx = 0;
  RADII.forEach((r, ri) => {
    const n = counts[ri];
    for (let i = 0; i < n; i++) {
      const ang = Math.PI + (Math.PI * (i + 0.5)) / n;
      assentos.push({
        // Arredonda p/ evitar divergência de ponto flutuante entre SSR e cliente
        // (mismatch de hidratação do React).
        x: Number((100 + r * Math.cos(ang)).toFixed(3)),
        y: Number((100 + r * Math.sin(ang)).toFixed(3)),
        a: lista[idx++] ?? "AUSENTE",
      });
    }
  });

  return (
    <div
      data-testid="hemiciclo"
      data-assentos={total}
      className="rounded-2xl border border-borda bg-superficie p-4 shadow-sm"
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-xs font-bold text-titulo">Assentos no {rotulo}</h2>
        <p className="font-mono text-[11px] text-corpo">{total} assentos</p>
      </div>
      <svg
        viewBox="0 0 200 112"
        role="img"
        aria-label={`Distribuição dos votos no ${rotulo}`}
        className="mx-auto block w-full max-w-md"
      >
        {assentos.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={1.7} fill={COR_GRAFICO[s.a]} />
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] font-medium">
        {ORDEM_VOTOS.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-corpo">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COR_GRAFICO[k] }}
            />
            {rotuloAlinhamento(k, pautaSlug)}: <strong className="font-mono text-titulo">{distribuicao[k]}</strong>
          </span>
        ))}
      </div>
    </div>
  );
});
