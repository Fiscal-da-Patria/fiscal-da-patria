/**
 * Ingestão do Senado Federal — Fiscal da Pátria.
 *
 * Fontes oficiais (dadosabertos.senado.leg.br):
 *   - Senadores em exercício:            /senador/lista/atual.json
 *   - Catálogo JSON das votações nominais recentes, COM os votos individuais: /votacao
 *   - Painel nominal por período (XML), para votações antigas: /plenario/lista/votacao/{AAAAMMDD}/{AAAAMMDD}
 *   - Foto oficial: https://www.senado.leg.br/senadores/img/fotos-oficiais/senador{id}.jpg
 *
 * Princípios (iguais aos da Câmara):
 *   - apenas fonte oficial; **nenhum voto é inventado**;
 *   - voto que não é Sim/Não/Abstenção é tratado como status oficial:
 *     `NCom` = ausência real; `AP`, `LS`, `P-NRV` e `Presidente` = sem voto
 *     individual (`NAO_APLICAVEL`, com o motivo no card);
 *   - mesma regra única de inversão semântica (`aplicarInversao`);
 *   - falha ⇒ aborta SEM sobrescrever os arquivos.
 *
 * Saídas:
 *   - `scripts/data/senadores_consolidados.json` (senadores + votos por pauta);
 *   - `scripts/data/senado_votacoes_map.json` (auditoria da verificação);
 *   - `public/fotos/sen-{codigo}.jpg` (fotos locais, same-origin p/ o card).
 *
 * Execução: `npm run fetch-senado`
 */
import fs from 'node:fs';
import path from 'node:path';

import { PAUTAS, aplicarInversao, normalizarVotoSenado, statusNaoVotoSenado } from '../src/lib/pautas';
import type { AlinhamentoVoto, VotoCanonico } from '../src/types/parlamentar';

const BASE = 'https://legis.senado.leg.br/dadosabertos';
const SAIDA = path.join(process.cwd(), 'scripts', 'data', 'senadores_consolidados.json');
const AUDITORIA = path.join(process.cwd(), 'scripts', 'data', 'senado_votacoes_map.json');
const FOTOS = path.join(process.cwd(), 'public', 'fotos');

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Identificacao {
  CodigoParlamentar: string;
  NomeParlamentar: string;
  NomeCompletoParlamentar?: string;
  SiglaPartidoParlamentar?: string;
  UfParlamentar?: string;
  UrlFotoParlamentar?: string;
}
interface SenadorBruto {
  IdentificacaoParlamentar: Identificacao;
}
interface RespostaLista {
  ListaParlamentarEmExercicio: {
    Parlamentares: { Parlamentar: SenadorBruto[] };
  };
}
interface VotoCatalogo {
  codigoParlamentar: number;
  siglaVotoParlamentar: string;
}
interface VotacaoCatalogo {
  codigoSessaoVotacao: number;
  votos?: VotoCatalogo[];
}
interface VotoPainel {
  CodigoParlamentar: string;
  Voto?: string;
}
interface VotacaoPainel {
  CodigoSessaoVotacao: string;
  Votos?: { VotoParlamentar?: VotoPainel | VotoPainel[] };
}

/** O mesmo endpoint pode devolver objeto (1 item) ou array — normaliza sempre. */
function comoArray<T>(x: T | T[] | undefined | null): T[] {
  if (Array.isArray(x)) return x;
  return x === undefined || x === null ? [] : [x];
}

/** GET com retry/backoff (erros de rede, 429 e 5xx). */
async function get(url: string, tentativas = 4): Promise<Response> {
  let ultimo: unknown;
  for (let t = 1; t <= tentativas; t++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json, application/xml' } });
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        ultimo = new Error(`HTTP ${res.status} em ${url}`);
        await sleep(700 * t);
        continue;
      }
      throw new Error(`HTTP ${res.status} em ${url}`);
    } catch (err) {
      ultimo = err;
      if (t < tentativas) await sleep(700 * t);
    }
  }
  throw ultimo instanceof Error ? ultimo : new Error(String(ultimo));
}

/** Votos do catálogo JSON (votações recentes, já com os votos individuais). */
async function votosDoCatalogo(codigo: number): Promise<Map<number, string> | null> {
  const res = await get(`${BASE}/votacao`);
  const lista = (await res.json()) as VotacaoCatalogo[];
  const votacao = lista.find((v) => Number(v.codigoSessaoVotacao) === codigo);
  if (!votacao?.votos) return null;
  const mapa = new Map<number, string>();
  for (const v of votacao.votos) mapa.set(Number(v.codigoParlamentar), v.siglaVotoParlamentar);
  return mapa.size > 0 ? mapa : null;
}

/**
 * Votos do painel nominal de um dia específico.
 *
 * O endpoint `/plenario/lista/votacao/{dia}/{dia}` devolve **XML** por padrão e
 * **JSON** quando o `Accept` pede JSON — usamos o JSON (mesma estrutura, mais
 * simples de percorrer).
 */
async function votosDoPainelDia(codigo: number, dataSessao: string): Promise<Map<number, string>> {
  const dia = dataSessao.replace(/-/g, '');
  const res = await get(`${BASE}/plenario/lista/votacao/${dia}/${dia}`);
  const json = (await res.json()) as {
    ListaVotacoes?: { Votacoes?: { Votacao?: VotacaoPainel | VotacaoPainel[] } };
  };

  const lista = comoArray(json.ListaVotacoes?.Votacoes?.Votacao);
  const alvo = lista.find((v) => Number(v.CodigoSessaoVotacao) === codigo);
  if (!alvo) {
    throw new Error(
      `Votação ${codigo} não está no painel nominal de ${dataSessao} — abortando sem inventar dados.`,
    );
  }

  const mapa = new Map<number, string>();
  for (const vp of comoArray(alvo.Votos?.VotoParlamentar)) {
    if (vp?.CodigoParlamentar) mapa.set(Number(vp.CodigoParlamentar), String(vp.Voto ?? ''));
  }
  if (mapa.size === 0) throw new Error(`Painel nominal da votação ${codigo} veio vazio — abortando.`);
  return mapa;
}

async function main(): Promise<void> {
  // 1) Senadores em exercício -------------------------------------------------
  const lista = (await (await get(`${BASE}/senador/lista/atual.json`)).json()) as RespostaLista;
  const brutos = lista.ListaParlamentarEmExercicio.Parlamentares.Parlamentar ?? [];
  if (brutos.length < 70) {
    throw new Error(`Esperados ~81 senadores em exercício, recebidos ${brutos.length} — abortando.`);
  }
  console.log(`👥 Senadores em exercício: ${brutos.length}`);

  fs.mkdirSync(FOTOS, { recursive: true });

  const senadores = brutos.map((s) => {
    const i = s.IdentificacaoParlamentar;
    const codigo = Number(i.CodigoParlamentar);
    return {
      id: `senado-${codigo}`,
      _codigo: codigo,
      cargo: 'SENADOR' as const,
      nome: i.NomeParlamentar,
      nomeCivil: i.NomeCompletoParlamentar ?? '',
      partido: i.SiglaPartidoParlamentar ?? '',
      uf: i.UfParlamentar ?? '',
      fotoUrl: `/fotos/sen-${codigo}.jpg`,
      _fotoRemota: (i.UrlFotoParlamentar ?? '').replace(/^http:/, 'https:'),
      urlPerfilOficial: `https://www25.senado.leg.br/web/senadores/senador/-/perfil/${codigo}`,
      votos: {} as Record<string, AlinhamentoVoto>,
      votosOriginais: {} as Record<string, VotoCanonico>,
      motivos: {} as Record<string, string>,
    };
  });

  // 2) Fotos oficiais locais (same-origin: exigidas pelo card exportável) ----
  let baixadas = 0;
  for (const s of senadores) {
    const destino = path.join(FOTOS, `sen-${s._codigo}.jpg`);
    if (fs.existsSync(destino) && fs.statSync(destino).size > 1000) continue;
    if (!s._fotoRemota) continue;
    const res = await get(s._fotoRemota);
    fs.writeFileSync(destino, Buffer.from(await res.arrayBuffer()));
    baixadas++;
    await sleep(120);
  }
  console.log(`📸 Fotos locais: ${baixadas} baixadas de ${senadores.length} senadores`);

  // 3) Votos nominais das pautas com status `nominal` ------------------------
  const auditoria: Record<string, unknown>[] = [];
  const comVoto = new Set<number>();

  for (const pauta of PAUTAS) {
    const conf = pauta.senado;
    if (!conf || conf.status !== 'nominal' || !conf.codigoSessaoVotacao) continue;

    let votos = await votosDoCatalogo(conf.codigoSessaoVotacao);
    let fonte = `${BASE}/votacao (catálogo JSON)`;
    if (!votos) {
      votos = await votosDoPainelDia(conf.codigoSessaoVotacao, conf.dataSessao);
      fonte = `${BASE}/plenario/lista/votacao/${conf.dataSessao.replace(/-/g, '')} (painel XML)`;
    }

    let sim = 0;
    let nao = 0;
    let abst = 0;
    let outros = 0;
    let processados = 0;
    const outrosDetalhe: Record<string, number> = {};

    for (const s of senadores) {
      const bruto = votos.get(s._codigo);
      if (bruto === undefined) continue; // não estava em exercício na data da votação
      processados++;

      const status = statusNaoVotoSenado(bruto);
      if (status) {
        const chave = bruto.trim().toUpperCase();
        outrosDetalhe[chave] = (outrosDetalhe[chave] ?? 0) + 1;
        outros++;
        if (status.ausente) {
          s.votos[pauta.slug] = 'AUSENTE';
          s.votosOriginais[pauta.slug] = 'AUSENTE';
        } else {
          s.votos[pauta.slug] = 'NAO_APLICAVEL';
        }
        s.motivos[pauta.slug] = status.motivo;
        continue;
      }

      const canonico = normalizarVotoSenado(bruto);
      if (canonico === 'SIM') sim++;
      else if (canonico === 'NAO') nao++;
      else if (canonico === 'ABSTENCAO') abst++;
      else outros++;

      s.votos[pauta.slug] = aplicarInversao(canonico, pauta.invertida);
      s.votosOriginais[pauta.slug] = canonico;
      comVoto.add(s._codigo);
    }

    if (sim + nao + abst + outros !== processados) {
      throw new Error(
        `Reconciliação falhou em ${pauta.slug}: atuais no painel=${processados}, contados=${sim + nao + abst + outros}.`,
      );
    }

    auditoria.push({
      pauta: pauta.slug,
      materia: pauta.materia,
      codigoSessaoVotacao: conf.codigoSessaoVotacao,
      dataSessao: conf.dataSessao,
      descricao: conf.descricao,
      status: conf.status,
      registros: votos.size,
      registrosAtuais: processados,
      sim,
      nao,
      abstencoes: abst,
      outros,
      outrosDetalhe,
      fonte,
    });
    console.log(
      `🗳️  ${pauta.materia} (${pauta.slug}): SIM=${sim} NÃO=${nao} ABST=${abst} outros=${outros} | registros=${votos.size}`,
    );
    await sleep(300);
  }

  // 4) Saídas -----------------------------------------------------------------
  fs.writeFileSync(
    SAIDA,
    JSON.stringify(
      {
        _fonte: 'Senado Federal — Dados Abertos (legis.senado.leg.br/dadosabertos)',
        _geradoEm: new Date().toISOString(),
        _senadores: senadores.length,
        _comVotoNominal: comVoto.size,
        senadores,
      },
      null,
      2,
    ) + '\n',
    'utf-8',
  );

  fs.writeFileSync(
    AUDITORIA,
    JSON.stringify(
      {
        _descricao:
          'Auditoria do mapeamento das pautas do MVP para as votações nominais do Senado Federal. Gerado por scripts/fetch_senado.ts.',
        _verificadoEm: new Date().toISOString(),
        _metodo:
          'Lista de senadores (/senador/lista/atual.json) + votos individuais (/votacao JSON ou /plenario/lista/votacao XML do dia).',
        _nota:
          'sim/nao/abstencoes/outros = senadores em exercício hoje; registros = painel completo.',
        votacoes: auditoria,
        semVotoNominal: PAUTAS.filter((p) => p.senado && p.senado.status !== 'nominal').map((p) => ({
          pauta: p.slug,
          materia: p.materia,
          status: p.senado?.status,
          nota: p.senado?.nota,
        })),
      },
      null,
      2,
    ) + '\n',
    'utf-8',
  );

  console.log(`\n✅ ${senadores.length} senadores gravados em ${SAIDA}`);
  console.log(`✅ Auditoria das votações em ${AUDITORIA}`);
}

main().catch((err) => {
  console.error('\n❌ Ingestão do Senado abortada (nenhum arquivo sobrescrito):', err);
  process.exit(1);
});