"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Casca de modal acessível baseada no `<dialog>` nativo.
 *
 * O navegador entrega foco preso, Esc, restauração de foco e backdrop; aqui só
 * cuidamos do scroll do body e de manter o React sincronizado ao fechar.
 */
export function Modal({
  aoFechar,
  rotuloId,
  children,
  largura = "max-w-sm",
}: {
  aoFechar: () => void;
  rotuloId: string;
  children: ReactNode;
  /** Classe de largura máxima (ex.: `max-w-2xl`). */
  largura?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const focoAnterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowAnterior;
      if (dialog.open) dialog.close();
      focoAnterior?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={rotuloId}
      onCancel={(e) => {
        // Mantém o estado do React sincronizado com o Esc nativo.
        e.preventDefault();
        aoFechar();
      }}
      onClick={(e) => {
        // Clique no backdrop (o alvo é o próprio <dialog>).
        if (e.target === e.currentTarget) aoFechar();
      }}
      className={`modal-civico m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] overflow-y-auto rounded-2xl border border-borda bg-superficie p-0 text-foreground shadow-2xl sm:max-h-[calc(100dvh-2rem)] ${largura}`}
    >
      {children}
    </dialog>
  );
}
