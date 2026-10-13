import Image from "next/image";
import { PAUTAS } from "@/lib/pautas";
import {
  COR_ALINHAMENTO,
  numeroCompacto,
  rotuloAlinhamento,
  rotuloCargo,
  textoDaCor,
} from "@/lib/parlamentares";
import type { AlinhamentoVoto, ParlamentarConsolidado } from "@/types/parlamentar";

export function ParlamentarCard({
  p,
  pautaSel,
  onAbrir,
}: {
  p: ParlamentarConsolidado;
  pautaSel: string;
  onAbrir: () => void;
}) {
  const alinhamento: AlinhamentoVoto = p.votos[pautaSel] ?? "AUSENTE";

  return (
    <div
      data-nome={p.nome}
      className="flex flex-col justify-between rounded-2xl border border-borda bg-superficie p-4 shadow-sm transition hover:shadow-md"
    >
      <div>
        <div className="mb-3 flex items-center gap-3">
          <Image
            src={p.fotoUrl}
            alt={p.nome}
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 rounded-full border border-borda object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="min-w-0 truncate text-sm font-bold text-titulo">{p.nome}</h3>
              {p.votosEleicao > 0 && (
                <span
                  data-votos={p.votosEleicao}
                  title={`${p.votosEleicao.toLocaleString("pt-BR")} votos recebidos nas urnas (TSE)`}
                  aria-label={`${p.votosEleicao.toLocaleString("pt-BR")} votos recebidos nas urnas (TSE)`}
                  className="shrink-0 rounded-md border border-dourado/60 bg-dourado/15 px-1.5 py-0.5 text-[10px] font-bold text-titulo"
                >
                  🗳️ {numeroCompacto(p.votosEleicao)}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  p.cargo === "SENADOR"
                    ? "border border-dourado/60 bg-dourado/15 text-titulo"
                    : "border border-verde-bandeira/40 bg-verde-bandeira/10 text-titulo"
                }`}
                data-cargo={p.cargo}
              >
                {rotuloCargo(p.cargo)} • {p.uf}
              </span>
              <span className="text-xs text-corpo">{p.partido}</span>
            </div>
          </div>
        </div>

        <div className="mb-2 flex gap-1" aria-hidden>
          {PAUTAS.map((pauta) => {
            const ativa = pauta.slug === pautaSel;
            return (
              <span
                key={pauta.slug}
                className={
                  ativa
                    ? "h-2.5 flex-1 rounded-full ring-1 ring-dourado"
                    : "h-1.5 flex-1 rounded-full"
                }
                style={{ backgroundColor: COR_ALINHAMENTO[p.votos[pauta.slug] ?? "AUSENTE"] }}
              />
            );
          })}
        </div>

        <div className="mb-3">
          <span
            className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: COR_ALINHAMENTO[alinhamento],
              color: textoDaCor(alinhamento),
            }}
          >
            {rotuloAlinhamento(alinhamento, pautaSel)}
          </span>
        </div>

        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-corpo">
            <span>Alinhamento cívico</span>
            <span
              className="font-bold text-titulo"
              title="Como é calculado: só contam as votações com voto individual — a favor = 1 ponto, abstenção = 0,3, contra/ausente = 0. Pautas sem voto individual (votação simbólica ou pendente na outra casa) não entram na conta."
            >
              {p.pontuacaoCivica}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-trilha">
            <div
              className="h-full rounded-full bg-dourado"
              style={{ width: `${p.pontuacaoCivica}%` }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onAbrir}
        className="w-full rounded-lg bg-trilha py-2 text-xs font-semibold text-titulo transition hover:bg-verde-mata hover:text-white"
      >
        Ver dossiê
      </button>
    </div>
  );
}

