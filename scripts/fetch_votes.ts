/**
 * Pipeline de ingestão unificada — Fiscal da Pátria.
 *
 * Monta `public/data/parlamentares.json` com o **Congresso Nacional**:
 *   - 513 deputados federais em exercício   (API oficial da Câmara);
 *   - 81 senadores em exercício             (Senado — dados abertos);
 *   - 10 pautas: 7 auditadas na Câmara + 3 auditadas no Senado.
 *
 * Regras inegociáveis (Tolerância Zero a Desinformação):
 *   - apenas fontes oficiais; **nenhum mock**; falha ⇒ aborta SEM sobrescrever;
 *   - `votos`: matriz densa de alinhamento (todas as 10 pautas presentes);
 *   - `votosOriginais`: voto bruto registrado na fonte (auditoria);
 *   - `motivos`: texto curto quando **não existe voto individual a auditar**
 *     (pauta de outra casa, votação simbólica do Senado, sem registro);
 *   - `pontuacaoCivica`: pontos ÷ pautas **aplicáveis** (exclui NAO_APLICAVEL),
 *     para não punir quem não podia votar.
 *
 * Execução: `npm run update-data`
 */
import fs from 'node:fs';
import path from 'node:path';

import { PAUTAS, aplicarInversao, normalizarVoto } from '../src/lib/pautas';
import type {
  AlinhamentoVoto,
  ParlamentarConsolidado,
  VotoCanonico,
} from '../src/types/parlamentar';

const API = 'https://dadosabertos.camara.leg.br/api/v2';
const SAIDA = path.join(process.cwd(), 'public', 'data', 'parlamentares.json');
const TSE = path.join(process.cwd(), 'scripts', 'data', 'tse_votos_urnas.json');
const SENADO = path.join(process.cwd(), 'scripts', 'data', 'senadores_consolidados.json');

const semAcento = (texto: string) =>
  (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Chave do mapa do TSE: "CARGO|NOME|UF". */
const chaveTse = (cargo: string, nome: string, uf: string) =>
  `${cargo}|${semAcento(nome)}|${semAcento(uf)}`;

/** Votos de urna (TSE) por "CARGO|NOME|UF" — ausência ⇒ votosEleicao = 0. */
function carregarVotosTse(): Map<string, number> {
  const mapa = new Map<string, number>();
  try {
    const bruto = JSON.parse(fs.readFileSync(TSE, 'utf-8')) as { mapa?: Record<string, number> };
    for (const [k, v] of Object.entries(bruto.mapa ?? {})) {
      if (typeof v === 'number' && v > 0) mapa.set(k, v);
    }
    console.log(`🗳️  Votos do TSE carregados: ${mapa.size} parlamentares.`);
  } catch {
    console.warn('⚠️  tse_votos_urnas.json indisponível — votosEleicao = 0 (rode `npm run fetch-tse`).');
  }
  return mapa;
}

interface SenadorArquivo {
  id: string;
  cargo: 'SENADOR';
  nome: string;
  nomeCivil?: string;
  partido: string;
  uf: string;
  fotoUrl: string;
  urlPerfilOficial: string;
  votos: Record<string, AlinhamentoVoto>;
  votosOriginais: Record<string, VotoCanonico>;
}

/** Senadores (roster + votos) gerados por scripts/fetch_senado.ts. */
function carregarSenadores(): SenadorArquivo[] {
  if (!fs.existsSync(SENADO)) {
    throw new Error(
      'scripts/data/senadores_consolidados.json ausente — rode `npm run fetch-senado` antes.',
    );
  }
  const bruto = JSON.parse(fs.readFileSync(SENADO, 'utf-8')) as { senadores?: SenadorArquivo[] };
  const senadores = bruto.senadores ?? [];
  if (senadores.length < 70) {
    throw new Error(`Esperados ~81 senadores, encontrados ${senadores.length} — abortando.`);
  }
  console.log(`👥 Senadores carregados: ${senadores.length}`);
  return senadores;
}

interface DeputadoBruto {
  id: number;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto?: string;
  email?: string;
}
interface VotoBruto {
  tipoVoto: string;
  deputado_?: DeputadoBruto;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET JSON com retry e backoff (rede, 429 e 5xx). */
async function fetchJson<T>(url: string, tentativas = 4): Promise<T> {
  let ultimo: unknown;
  for (let t = 1; t <= tentativas; t++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) return (await res.json()) as T;
      if (res.status === 429 || res.status >= 500) {
        ultimo = new Error(`HTTP ${res.status} em ${url}`);
        await sleep(600 * t);
        continue;
      }
      throw new Error(`HTTP ${res.status} em ${url}`);
    } catch (err) {
      ultimo = err;
      if (t < tentativas) await sleep(600 * t);
    }
  }
  throw ultimo instanceof Error ? ultimo : new Error(String(ultimo));
}

async function main(): Promise<void> {
  const votosTse = carregarVotosTse();
  const senadoresArquivo = carregarSenadores();

  // ---------------------------------------------------------------------------
  // 1) Deputados federais em exercício (roster oficial da Câmara)
  // ---------------------------------------------------------------------------
  const listaDep = await fetchJson<{ dados: DeputadoBruto[] }>(`${API}/deputados?itens=1000`);
  if (!listaDep.dados?.length) throw new Error('A Câmara não retornou deputados — abortando.');

  const deputados = new Map<number, ParlamentarConsolidado>();
  for (const d of listaDep.dados) {
    deputados.set(d.id, {
      id: `camara-${d.id}`,
      cargo: 'DEPUTADO',
      nome: d.nome,
      partido: d.siglaPartido,
      uf: d.siglaUf,
      fotoUrl: fs.existsSync(path.join(process.cwd(), 'public', 'fotos', `${d.id}.jpg`))
        ? `/fotos/${d.id}.jpg`
        : d.urlFoto && d.urlFoto.length > 0
          ? d.urlFoto
          : `https://www.camara.leg.br/internet/deputado/bandep/${d.id}.jpg`,
      email: d.email ?? '',
      urlPerfilOficial: `https://www.camara.leg.br/deputados/${d.id}`,
      votosEleicao: votosTse.get(chaveTse('DEPUTADO', d.nome, d.siglaUf)) ?? 0,
      votos: {},
      votosOriginais: {},
    });
  }
  console.log(`👥 Deputados em exercício: ${deputados.size}`);

  // ---------------------------------------------------------------------------
  // 2) Votos nominais na Câmara (pautas com `casa: CAMARA`)
  // ---------------------------------------------------------------------------
  const reconciliacao: string[] = [];

  for (const pauta of PAUTAS) {
    if (pauta.casa !== 'CAMARA' || !pauta.votacaoId) continue;

    const resposta = await fetchJson<{ dados: VotoBruto[] }>(
      `${API}/votacoes/${pauta.votacaoId}/votos`,
    );
    const votosBrutos = resposta.dados ?? [];
    if (votosBrutos.length === 0) {
      throw new Error(
        `A votação ${pauta.votacaoId} (${pauta.materia}) não retornou votos. Abortando — nenhum mock será criado.`,
      );
    }

    let sim = 0;
    let nao = 0;
    let abst = 0;
    let registrados = 0;

    for (const vb of votosBrutos) {
      const dep = vb.deputado_;
      if (!dep) continue;
      const p = deputados.get(dep.id);
      if (!p) continue; // suplente fora de exercício: não entra na listagem

      const canonico = normalizarVoto(vb.tipoVoto);
      if (canonico === 'SIM') sim++;
      else if (canonico === 'NAO') nao++;
      else if (canonico === 'ABSTENCAO') abst++;

      p.votos[pauta.slug] = aplicarInversao(canonico, pauta.invertida);
      p.votosOriginais![pauta.slug] = canonico;
      registrados++;
    }

    reconciliacao.push(
      `${pauta.slug} [${pauta.votacaoId}]: SIM=${sim} NÃO=${nao} ABST=${abst} (deputados em exercício=${registrados})`,
    );
    await sleep(300);
  }

  // ---------------------------------------------------------------------------
  // 3) Matriz densa + motivos (deputados e senadores)
  // ---------------------------------------------------------------------------
  const lista: ParlamentarConsolidado[] = [];

  for (const p of deputados.values()) {
    p.motivos = {};
    for (const pauta of PAUTAS) {
      if (p.votos[pauta.slug]) continue;
      if (pauta.casa === 'SENADO') {
        p.votos[pauta.slug] = 'NAO_APLICAVEL';
        p.motivos[pauta.slug] =
          `Pauta auditada no Senado (${pauta.materia}) — não há voto nominal da Câmara apurado neste MVP.`;
      } else {
        // Estava em exercício e não registrou voto naquela votação.
        p.votos[pauta.slug] = 'AUSENTE';
        p.votosOriginais![pauta.slug] = 'AUSENTE';
      }
    }
    lista.push(p);
  }

  for (const s of senadoresArquivo) {
    const p: ParlamentarConsolidado = {
      id: s.id,
      cargo: 'SENADOR',
      nome: s.nome,
      nomeCivil: s.nomeCivil,
      partido: s.partido,
      uf: s.uf,
      fotoUrl: s.fotoUrl,
      urlPerfilOficial: s.urlPerfilOficial,
      votosEleicao: votosTse.get(chaveTse('SENADOR', s.nome, s.uf)) ?? 0,
      votos: { ...s.votos },
      votosOriginais: { ...s.votosOriginais },
      motivos: {},
    };

    for (const pauta of PAUTAS) {
      if (p.votos[pauta.slug]) continue;
      const conf = pauta.senado;
      p.votos[pauta.slug] = 'NAO_APLICAVEL';
      if (conf?.status === 'nominal') {
        p.motivos![pauta.slug] =
          `Sem registro no painel nominal de ${conf.dataSessao} — o Senado só registra voto de quem estava em exercício na sessão.`;
      } else {
        p.motivos![pauta.slug] = conf?.nota ?? 'Sem voto individual registrado no Senado.';
      }
    }
    lista.push(p);
  }

  // O app não usa nota de alinhamento: a saída fica em ordem alfabética (determinística).
  lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  // ---------------------------------------------------------------------------
  // 5) Saída
  // ---------------------------------------------------------------------------
  const dep = lista.filter((p) => p.cargo === 'DEPUTADO');
  const sen = lista.filter((p) => p.cargo === 'SENADOR');
  console.log('\n📊 Reconciliação (votos nominais na Câmara):');
  for (const r of reconciliacao) console.log(`   - ${r}`);

  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify(lista, null, 2) + '\n', 'utf-8');

  console.log(`\n✅ ${lista.length} parlamentares gravados em ${SAIDA}`);
  console.log(`   deputados: ${dep.length} | senadores: ${sen.length}`);
  console.log(
    `   com votos do TSE: deputados ${dep.filter((p) => p.votosEleicao > 0).length}/${dep.length} | senadores ${sen.filter((p) => p.votosEleicao > 0).length}/${sen.length}`,
  );
}

main().catch((err) => {
  console.error('\n❌ Ingestão abortada (nenhum arquivo foi sobrescrito):', err);
  process.exit(1);
});
