"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toPng } from "html-to-image";
import confetti from "canvas-confetti";
import { Download, ShieldCheck } from "lucide-react";
import { COR_ALINHAMENTO, ROTULO_VOTO_BRUTO, iniciais, rotuloAlinhamento, rotuloCargo, textoDaCor } from "@/lib/parlamentares";
import type { AlinhamentoVoto, PautaConfig, ParlamentarConsolidado } from "@/types/parlamentar";

/**
 * Cartão exportável (PNG 4:5) com a **PAUTA no centro** e o voto de um
 * parlamentar específico — o "assunto" do compartilhamento no Zap.
 *
 * Ex.: "Comida sem imposto (Cesta Básica) · PEC 45/2019" + "Fulano (PL-RJ)
 * votou CONTRA o cidadão — voto registrado: NÃO".
 */
export function CardPauta({
  parlamentar,
  pauta,
}: {
  parlamentar: ParlamentarConsolidado;
  pauta: PautaConfig;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);

  const alinhamento: AlinhamentoVoto = parlamentar.votos[pauta.slug] ?? "AUSENTE";
  const bruto = parlamentar.votosOriginais?.[pauta.slug];
  const motivo = parlamentar.motivos?.[pauta.slug];
  const casa = pauta.casa === "SENADO" ? "Senado Federal" : "Câmara dos Deputados";

  async function exportar() {
    if (!ref.current) return;
    setGerando(true);
    try {
      const dataUrl = await toPng(ref.current, {
        canvasWidth: 1080,
        canvasHeight: 1350,
        pixelRatio: 1,
      });
      const link = document.createElement("a");
      link.download = `Fiscal_da_Patria_${pauta.slug}_${parlamentar.nome.replace(/\s+/g, "_")}.png`;
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
        className="flex h-[450px] w-[360px] flex-col justify-between overflow-hidden rounded-2xl bg-verde-mata p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-dourado">
            <ShieldCheck className="h-4 w-4" /> Votação no {casa}
          </span>
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/70">
            Fiscal da Pátria
          </span>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-dourado">
            {pauta.materia}
          </p>
          <h3 className="mt-1 text-2xl font-black leading-tight">{pauta.rotuloPopular}</h3>
          <p className="mt-2 line-clamp-3 text-[11px] leading-snug text-white/70">
            {pauta.ementaOficial}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          {parlamentar.fotoUrl.startsWith("/fotos/") ? (
            <Image
              src={parlamentar.fotoUrl}
              alt={parlamentar.nome}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 shrink-0 rounded-full border-2 border-dourado object-cover"
            />
          ) : (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-dourado bg-verde-bandeira text-lg font-black text-dourado">
              {iniciais(parlamentar.nome)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{parlamentar.nome}</p>
            <p className="text-[11px] text-white/70">
              {rotuloCargo(parlamentar.cargo)} • {parlamentar.partido}-{parlamentar.uf}
            </p>
          </div>
        </div>

        <div
          className="rounded-xl px-4 py-3 text-center"
          style={{ backgroundColor: COR_ALINHAMENTO[alinhamento], color: textoDaCor(alinhamento) }}
        >
          <p className="text-lg font-black leading-tight">
            {rotuloAlinhamento(alinhamento, pauta.slug)}
          </p>
          {bruto && alinhamento !== "NAO_APLICAVEL" && (
            <p className="text-[11px] font-semibold opacity-90">
              Voto registrado: {ROTULO_VOTO_BRUTO[bruto]}
            </p>
          )}
          {!bruto && motivo && <p className="text-[10px] leading-snug opacity-90">{motivo}</p>}
        </div>

        <div className="border-t border-white/15 pt-3 text-center">
          <p className="text-[10px] text-white/70">
            Dados oficiais • {pauta.casa === "SENADO" ? "senado.leg.br" : "camara.leg.br"}
          </p>
          <p className="text-[10px] font-bold text-dourado">fiscaldapatria.org.br</p>
        </div>
      </div>

      <button
        type="button"
        onClick={exportar}
        disabled={gerando}
        className="inline-flex items-center gap-2 rounded-lg bg-verde-mata px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-verde-bandeira disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {gerando ? "Gerando imagem…" : "Exportar cartão da pauta (PNG 4:5)"}
      </button>
    </div>
  );
}