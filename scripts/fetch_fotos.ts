/**
 * Pipeline de fotos oficiais — Fiscal da Pátria.
 *
 * Baixa as fotos dos deputados do portal da Câmara para `public/fotos/{id}.jpg`
 * (arquivos locais, *same-origin*) e reescreve o campo `foto` do consolidado para
 * o caminho local. Isso resolve a ausência de CORS das fotos da Câmara e permite
 * que a carteirinha exportável embuta a foto oficial.
 *
 * Execução: `npm run fetch-fotos` (ou `npm run update-all`).
 */
import fs from 'node:fs';
import path from 'node:path';

import type { ParlamentarConsolidado } from '../src/types/parlamentar';

const JSON_PATH = path.join(process.cwd(), 'public', 'data', 'parlamentares.json');
const FOTOS_DIR = path.join(process.cwd(), 'public', 'fotos');
const CONCORRENCIA = 8;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const urlOficial = (id: number) =>
  `https://www.camara.leg.br/internet/deputado/bandep/${id}.jpg`;

/** Baixa uma foto (com retry). Retorna true se o arquivo local existe ao final. */
async function baixarUma(id: number): Promise<boolean> {
  const destino = path.join(FOTOS_DIR, `${id}.jpg`);
  if (fs.existsSync(destino) && fs.statSync(destino).size > 0) return true;

  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const res = await fetch(urlOficial(id), { headers: { Accept: 'image/jpeg' } });
      if (res.status === 404) return false; // deputado sem foto
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length === 0) throw new Error('imagem vazia');
        fs.writeFileSync(destino, buffer);
        return true;
      }
    } catch {
      // rede/erro transitório → tenta de novo
    }
    await sleep(400 * tentativa);
  }
  return false;
}

async function main(): Promise<void> {
  console.log('📸 Fiscal da Pátria — download das fotos oficiais');
  const parlamentares = JSON.parse(
    fs.readFileSync(JSON_PATH, 'utf-8'),
  ) as ParlamentarConsolidado[];
  fs.mkdirSync(FOTOS_DIR, { recursive: true });

  const total = parlamentares.length;
  let ok = 0;
  let semFoto = 0;
  let idx = 0;

  async function trabalhador(): Promise<void> {
    while (idx < total) {
      const atual = parlamentares[idx++];
      // Só deputados: as fotos dos senadores vêm de `scripts/fetch_senado.ts`.
      if (atual.cargo !== 'DEPUTADO') continue;
      const idNumerico = Number(atual.id.replace(/^camara-/, ''));
      const sucesso = await baixarUma(idNumerico);
      if (sucesso) {
        atual.fotoUrl = `/fotos/${idNumerico}.jpg`;
        ok++;
      } else {
        semFoto++;
      }
      if ((ok + semFoto) % 100 === 0) console.log(`   ...${ok + semFoto}/${total}`);
    }
  }

  await Promise.all(Array.from({ length: CONCORRENCIA }, () => trabalhador()));

  fs.writeFileSync(JSON_PATH, JSON.stringify(parlamentares, null, 2) + '\n', 'utf-8');

  console.log(`\n✅ Fotos locais: ${ok} | sem foto: ${semFoto} | total: ${total}`);
  console.log(`📁 ${FOTOS_DIR}`);
}

main().catch((err) => {
  console.error('❌ Falha no pipeline de fotos:', err);
  process.exit(1);
});
