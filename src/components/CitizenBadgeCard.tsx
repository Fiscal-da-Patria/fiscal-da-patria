"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toPng } from "html-to-image";
import confetti from "canvas-confetti";
import { Download, ShieldCheck } from "lucide-react";
import { PAUTAS } from "@/lib/pautas";
import { COR_ALINHAMENTO, iniciais, rotuloAlinhamento, rotuloCargo, textoDaCor } from "@/lib/parlamentares";
import type { ParlamentarConsolidado } from "@/types/parlamentar";

/**
 * Carteirinha/Selo do Auditor Cívico — card 9:16 (1080×1920) exportável.
 *
 * Nota: as fotos oficiais da Câmara não enviam cabeçalho CORS, o que "tingiria"
 * o canvas do html-to-image. Por isso o card usa um avatar com iniciais. (Na
 * Fase 4, o pipeline de fotos locais permitirá embutir a foto oficial.)
 */
export function CitizenBadgeCard({ parlamentar }: { parlamentar: ParlamentarConsolidado }) {
  const ref = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);

  async function exportar() {
    if (!ref.current) return;
    setGerando(true);
    try {
      const dataUrl = await toPng(ref.current, {
        canvasWidth: 1080,
        canvasHeight: 1920,
        pixelRatio: 1,
      });
      const link = document.createElement("a");
      link.download = `Fiscal_da_Patria_${parlamentar.nome.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
    } catch (err) {
      console.error("Falha ao gerar a imagem:", err);
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={ref}
        className="flex h-[640px] w-[360px] flex-col justify-between overflow-hidden rounded-2xl bg-verde-mata p-7 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-dourado">
            <ShieldCheck className="h-4 w-4" /> Selo de Transparência Cívica
          </span>
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/70">
            Fiscal da Pátria
          </span>
        </div>

        <div className="flex flex-col items-center text-center">
          {parlamentar.fotoUrl.startsWith("/fotos/") ? (
            <Image
              src={parlamentar.fotoUrl}
              alt={parlamentar.nome}
              width={112}
              height={112}
              unoptimized
              className="mb-4 h-28 w-28 rounded-full border-4 border-dourado object-cover"
            />
          ) : (
            <div className="mb-4 grid h-28 w-28 place-items-center rounded-full border-4 border-dourado bg-verde-bandeira text-4xl font-black text-dourado">
              {iniciais(parlamentar.nome)}
            </div>
          )}
          <h3 className="text-2xl font-black leading-tight">{parlamentar.nome}</h3>
          <p className="mt-1 text-sm font-medium text-white/70">
            {rotuloCargo(parlamentar.cargo)} • {parlamentar.partido} • {parlamentar.uf}
          </p>
          <div className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
              Alinhamento cívico
            </p>
            <p className="text-4xl font-black text-dourado">{parlamentar.pontuacaoCivica}%</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {PAUTAS.map((pauta) => {
            const a = parlamentar.votos[pauta.slug] ?? "AUSENTE";
            return (
              <div key={pauta.slug} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate text-white/85">{pauta.rotuloPopular}</span>
                <span
                  className="shrink-0 rounded px-2 py-0.5 font-bold"
                  style={{
                    backgroundColor: COR_ALINHAMENTO[a],
                    color: textoDaCor(a),
                  }}
                >
                  {rotuloAlinhamento(a, pauta.slug)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/15 pt-3 text-center">
          <p className="text-[10px] text-white/70">
            Dados oficiais • {parlamentar.cargo === "SENADOR" ? "senado.leg.br" : "camara.leg.br"}
          </p>
          <p className="text-[10px] font-bold text-dourado">Audite você também</p>
        </div>
      </div>

      <button
        type="button"
        onClick={exportar}
        disabled={gerando}
        className="inline-flex items-center gap-2 rounded-lg bg-verde-mata px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-verde-bandeira disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {gerando ? "Gerando imagem…" : "Exportar cartão (PNG 9:16)"}
      </button>
    </div>
  );
}
