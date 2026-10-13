import { COR_ALINHAMENTO, rotuloAlinhamento } from "@/lib/parlamentares";
import type { AlinhamentoVoto } from "@/types/parlamentar";

const ASSENTOS = 594;
const RADII = [90, 82, 74, 66, 58, 50, 42, 34, 26];
const ORDEM: AlinhamentoVoto[] = [
  "FAVORAVEL",
  "CONTRA",
  "ABSTENCAO",
  "AUSENTE",
  "NAO_APLICAVEL",
];

/**
 * Mini-hemiciclo: assentos em semicírculo, coloridos pela PROPORÇÃO de votos da
 * pauta selecionada, considerando os parlamentares do filtro atual
 * (Câmara + Senado = Congresso Nacional).
 */
export function Hemiciclo({
  distribuicao,
  rotulo = "Congresso Nacional",
  pautaSlug,
}: {
  distribuicao: Record<AlinhamentoVoto, number>;
  rotulo?: string;
  pautaSlug?: string;
}) {
  const total = ORDEM.reduce((s, k) => s + distribuicao[k], 0) || 1;

  const somaR = RADII.reduce((a, b) => a + b, 0);
  const counts = RADII.map((r) => Math.round((ASSENTOS * r) / somaR));
  counts[0] += ASSENTOS - counts.reduce((a, b) => a + b, 0);

  const lista: AlinhamentoVoto[] = [];
  for (const k of ORDEM) {
    const n = Math.round((distribuicao[k] / total) * ASSENTOS);
    for (let i = 0; i < n; i++) lista.push(k);
  }
  while (lista.length < ASSENTOS) lista.push("AUSENTE");
  lista.length = ASSENTOS;

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
    <div className="rounded-2xl border border-borda bg-superficie p-4 shadow-sm">
      <svg
        viewBox="0 0 200 112"
        role="img"
        aria-label={`Distribuição dos votos no ${rotulo}`}
        className="mx-auto block w-full max-w-md"
      >
        {assentos.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={1.7} fill={COR_ALINHAMENTO[s.a]} />
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] font-medium">
        {ORDEM.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-corpo">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COR_ALINHAMENTO[k] }}
            />
            {rotuloAlinhamento(k, pautaSlug)}: <strong className="text-titulo">{distribuicao[k]}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
