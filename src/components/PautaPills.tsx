"use client";

import { useState } from "react";
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

/** Quantas pautas ficam visíveis antes do botão "Ver todas" no celular. */
const PRINCIPAIS = 4;

export function PautaPills({
  selecionada,
  onSelecionar,
}: {
  selecionada: string;
  onSelecionar: (slug: string) => void;
}) {
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const base = new Set(PAUTAS.slice(0, PRINCIPAIS).map((p) => p.slug));

  return (
    <div>
      <div
        id="lista-pautas"
        role="group"
        aria-label="Escolher pauta"
        className="flex flex-wrap gap-1.5 sm:gap-2"
        data-pautas-pills="1"
      >
        {PAUTAS.map((p) => {
          const ativa = p.slug === selecionada;
          const visivelNoMobile = base.has(p.slug) || p.slug === selecionada;
          const oculta = !mostrarTodas && !visivelNoMobile;

          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => onSelecionar(p.slug)}
              aria-pressed={ativa}
              aria-label={p.rotuloPopular}
              title={p.rotuloPopular}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition sm:px-3.5 sm:py-1.5 sm:text-xs ${
                oculta ? "hidden sm:inline-flex" : ""
              } ${
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

      {PAUTAS.length > PRINCIPAIS && (
        <button
          type="button"
          onClick={() => setMostrarTodas((v) => !v)}
          aria-expanded={mostrarTodas}
          aria-controls="lista-pautas"
          className="mt-2 inline-flex min-h-11 items-center gap-1 rounded-full border border-borda bg-superficie px-3 py-1.5 text-xs font-bold text-titulo transition hover:border-dourado sm:hidden"
        >
          {mostrarTodas ? "Mostrar menos" : `Ver todas as ${PAUTAS.length} pautas`}
        </button>
      )}
    </div>
  );
}