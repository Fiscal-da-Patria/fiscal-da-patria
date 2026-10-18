"use client";

import { useId, useRef, useState, type ReactNode } from "react";

/**
 * Carrossel nativo para grupos curados no celular.
 *
 * - O trilho usa scroll-snap do próprio navegador (sem biblioteca).
 * - Os dots só aparecem no mobile; no desktop o `trilhoClassName` restaura a grade.
 * - Cada slide precisa ter `data-slide` para a sincronização dos indicadores.
 */
export function CarrosselMobile({
  rotulo,
  total,
  trilhoClassName,
  dotsClassName = "md:hidden",
  children,
}: {
  rotulo: string;
  total: number;
  trilhoClassName: string;
  /** Breakpoint em que os dots somem (ex.: `md:hidden` ou `sm:hidden`). */
  dotsClassName?: string;
  children: ReactNode;
}) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);
  const id = useId();

  function slides() {
    const trilho = trilhoRef.current;
    return trilho ? Array.from(trilho.querySelectorAll<HTMLElement>("[data-slide]")) : [];
  }

  function sincronizar() {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    const caixa = trilho.getBoundingClientRect();
    const centro = caixa.left + caixa.width / 2;
    let melhor = 0;
    let menor = Number.POSITIVE_INFINITY;

    slides().forEach((slide, i) => {
      const r = slide.getBoundingClientRect();
      const distancia = Math.abs(r.left + r.width / 2 - centro);
      if (distancia < menor) {
        menor = distancia;
        melhor = i;
      }
    });

    setAtivo((anterior) => (anterior === melhor ? anterior : melhor));
  }

  function irPara(i: number) {
    const trilho = trilhoRef.current;
    const slide = slides()[i];
    if (!trilho || !slide) return;

    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const destino =
      slide.getBoundingClientRect().left - trilho.getBoundingClientRect().left + trilho.scrollLeft;

    trilho.scrollTo({
      left: destino,
      behavior: reduzirMovimento ? "auto" : "smooth",
    });
    setAtivo(i);
  }

  return (
    <div>
      <div
        id={id}
        ref={trilhoRef}
        onScroll={sincronizar}
        role="group"
        aria-roledescription="carrossel"
        aria-label={rotulo}
        className={trilhoClassName}
      >
        {children}
      </div>
      <div
        className={`mt-3 flex items-center justify-center gap-0.5 ${dotsClassName}`}
        role="group"
        aria-label={`Navegação do carrossel: ${rotulo}`}
      >
        {Array.from({ length: total }, (_, i) => {
          const ativoAgora = ativo === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => irPara(i)}
              aria-label={`Ir para o item ${i + 1} de ${total}: ${rotulo}`}
              aria-controls={id}
              aria-current={ativoAgora ? "true" : undefined}
              className="grid h-11 w-8 place-items-center rounded-lg"
            >
              <span
                className={`h-1.5 rounded-full transition-all ${
                  ativoAgora ? "w-5 bg-verde-mata dark:bg-dourado" : "w-1.5 bg-corpo-fraco"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}