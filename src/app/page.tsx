import { readFileSync } from "node:fs";
import path from "node:path";
import { Dashboard } from "@/components/Dashboard";
import type { ParlamentarConsolidado } from "@/types/parlamentar";

/**
 * Server Component: lê o JSON consolidado em build-time e entrega o dashboard
 * já renderizado com os dados. Nada de fetch de ~0,85 MB depois da hidratação.
 */
function carregarParlamentares(): ParlamentarConsolidado[] {
  const arquivo = path.join(process.cwd(), "public", "data", "parlamentares.json");
  return JSON.parse(readFileSync(arquivo, "utf8")) as ParlamentarConsolidado[];
}

export default function HomePage() {
  return <Dashboard dados={carregarParlamentares()} />;
}
