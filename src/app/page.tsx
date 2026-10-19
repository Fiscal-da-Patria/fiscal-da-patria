import type { Metadata } from "next";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { Dashboard } from "@/components/Dashboard";
import type { ParlamentarConsolidado } from "@/types/parlamentar";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Server Component: lê o JSON consolidado em build-time e entrega o dashboard
 * já renderizado com os dados. Nada de fetch de ~0,85 MB depois da hidratação.
 * A data vem do mtime do arquivo (gerado pelo pipeline de dados).
 */
function carregarDados(): {
  parlamentares: ParlamentarConsolidado[];
  atualizadoEm: string;
} {
  const arquivo = path.join(process.cwd(), "public", "data", "parlamentares.json");
  const parlamentares = JSON.parse(readFileSync(arquivo, "utf8")) as ParlamentarConsolidado[];
  const atualizadoEm = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(statSync(arquivo).mtime);
  return { parlamentares, atualizadoEm };
}

export default function HomePage() {
  const { parlamentares, atualizadoEm } = carregarDados();
  return <Dashboard dados={parlamentares} atualizadoEm={atualizadoEm} />;
}
