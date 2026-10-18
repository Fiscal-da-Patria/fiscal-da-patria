import { ORDEM_VOTOS } from "@/lib/partidos";
import type { AlinhamentoVoto } from "@/types/parlamentar";

/**
 * Barra proporcional de votos (uma faixa por alinhamento). Reutilizada no
 * gráfico por partido e nos cartões compartilháveis.
 */
export function BarraVotos({
  contagem,
  total,
  cores,
  className = "h-3 bg-trilha",
  rotulo,
  tituloDe,
}: {
  contagem: Record<AlinhamentoVoto, number>;
  total: number;
  cores: Record<AlinhamentoVoto, string>;
  /** Altura/fundo da trilha (ex.: `h-1 bg-white/15`). */
  className?: string;
  /** Quando presente, a barra vira uma imagem com descrição para leitores de tela. */
  rotulo?: string;
  tituloDe?: (k: AlinhamentoVoto, n: number) => string;
}) {
  return (
    <div
      className={`flex w-full overflow-hidden rounded-full ${className}`}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
    >
      {ORDEM_VOTOS.map((k) =>
        contagem[k] > 0 ? (
          <span
            key={k}
            className="h-full"
            style={{
              width: `${total > 0 ? (contagem[k] / total) * 100 : 0}%`,
              backgroundColor: cores[k],
            }}
            title={tituloDe?.(k, contagem[k])}
          />
        ) : null,
      )}
    </div>
  );
}
