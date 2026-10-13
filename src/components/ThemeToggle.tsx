"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Alternância de tema (claro/escuro) sem estado React: o ícone é trocado por CSS
 * (variante `dark:`) e a preferência é persistida no localStorage.
 */
export function ThemeToggle() {
  function alternar() {
    const escuro = document.documentElement.classList.toggle("dark");
    document.documentElement.style.colorScheme = escuro ? "dark" : "light";
    try {
      localStorage.setItem("fiscal-tema", escuro ? "escuro" : "claro");
    } catch {
      /* localStorage indisponível */
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Alternar tema (claro/escuro)"
      title="Alternar tema"
      className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
    >
      <Moon className="h-4 w-4 dark:hidden" aria-hidden />
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden />
    </button>
  );
}

