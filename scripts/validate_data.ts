/**
 * Validador independente dos dados publicados — Fiscal da Pátria.
 *
 * Reconsulta as APIs oficiais e compara, voto a voto, o que está em
 * `public/data/parlamentares.json`. Sai com código 1 em qualquer divergência.
 *
 * Uso: `npm run validate-data`
 */
import fs from 'node:fs';
import path from 'node:path';

import {
  PAUTAS,
  aplicarInversao,
  normalizarVoto,
  normalizarVotoSenado,
  statusNaoVotoCamara,
  statusNaoVotoSenado,
} from '../src/lib/pautas';
import type { ParlamentarConsolidado, PautaConfig } from '../src/types/parlamentar';

const API = 'https://dadosabertos.camara.leg.br/api/v2';
const SEN = 'https://legis.senado.leg.br/dadosabertos';
const ARQUIVO = path.join(process.cwd(), 'public', 'data', 'parlamentares.json');

const falhas: string[] = [];
const falhar = (msg: string) => {
  falhas.push(msg);
  console.error(`❌ ${msg}`);
};
const ok = (msg: string) => console.log(`✅ ${msg}`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson<T>(url: string, tentativas = 4): Promise<T> {
  let ultimo: unknown;
  for (let t = 1; t <= tentativas; t++) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (r.ok) return (await r.json()) as T;
      if (r.status === 429 || r.status >= 500) {
        ultimo = new Error(`HTTP ${r.status} em ${url}`);
        await sleep(500 * t);
        continue;
      }
      throw new Error(`HTTP ${r.status} em ${url}`);
    } catch (e) {
      ultimo = e;
      if (t < tentativas) await sleep(500 * t);
    }
  }
  throw ultimo instanceof Error ? ultimo : new Error(String(ultimo));
}

const arr = <T>(x: T | T[] | undefined | null): T[] =>
  Array.isArray(x) ? x : x === undefined || x === null ? [] : [x];

interface CamaraRoster {
  id: number;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
}
interface CamaraVoto {
  tipoVoto: string;
  deputado_?: { id: number };
}
interface SenadoVoto {
  CodigoParlamentar: string;
  Voto?: string;
}
interface SenadoVotacao {
  CodigoSessaoVotacao: string | number;
  Votos?: { VotoParlamentar?: SenadoVoto | SenadoVoto[] };
}
interface SenadoLista {
  ListaVotacoes?: { Votacoes?: { Votacao?: SenadoVotacao | SenadoVotacao[] } };
}
interface SenadoMateria {
  DetalheMateria?: {
    Materia?: {
      IdentificacaoMateria?: {
        SiglaSubtipoMateria?: string;
        SiglaTipoMateria?: string;
        NumeroMateria?: string;
        AnoMateria?: string;
      };
    };
  };
}
interface SenadoIdent {
  CodigoParlamentar: string;
  NomeParlamentar: string;
  SiglaPartidoParlamentar?: string;
  UfParlamentar?: string;
}
interface SenadoAtual {
  ListaParlamentarEmExercicio?: {
    Parlamentares?: { Parlamentar?: Array<{ IdentificacaoParlamentar: SenadoIdent }> };
  };
}

function parsePlacar(txt: string | undefined, re: RegExp): number | null {
  const m = txt?.match(re);
  return m ? Number(m[1]) : null;
}

async function validarCamara(pauta: PautaConfig, deputados: ParlamentarConsolidado[]) {
  if (!pauta.votacaoId || !pauta.idProposicao) return;

  const meta = await getJson<{ dados: { data: string } }>(
    `${API}/votacoes/${pauta.votacaoId}`,
  );
  const data = meta.dados?.data;
  if (!data) {
    falhar(`${pauta.slug}: votação sem data oficial`);
    return;
  }
  const votosResp = await getJson<{ dados: CamaraVoto[] }>(
    `${API}/votacoes/${pauta.votacaoId}/votos`,
  );
  const roster = await getJson<{ dados: CamaraRoster[] }>(
    `${API}/deputados?dataInicio=${data}&dataFim=${data}&itens=1000`,
  );
  const emExercicio = new Set(roster.dados.map((d) => d.id));
  const api = new Map<number, string>();
  for (const v of votosResp.dados) if (v.deputado_) api.set(v.deputado_.id, v.tipoVoto);

  const prop = await getJson<{
    dados: { siglaTipo: string; numero: number; ano: number };
  }>(`${API}/proposicoes/${pauta.idProposicao}`);
  const materia = `${prop.dados.siglaTipo} ${prop.dados.numero}/${prop.dados.ano}`;
  if (materia !== pauta.materia) {
    falhar(`${pauta.slug}: matéria ${materia} ≠ ${pauta.materia}`);
  }

  let conferidos = 0;
  let ausentes = 0;
  let semVoto = 0;
  for (const p of deputados) {
    const id = Number(p.id.slice('camara-'.length));
    const raw = api.get(id);
    const local = p.votos[pauta.slug];
    const bruto = p.votosOriginais?.[pauta.slug];

    if (raw !== undefined) {
      const status = statusNaoVotoCamara(raw);
      if (status) {
        if (local !== 'NAO_APLICAVEL') falhar(`${p.nome} ${pauta.slug}: ${raw} local=${local}`);
        if (p.motivos?.[pauta.slug] !== status) falhar(`${p.nome} ${pauta.slug}: motivo divergente`);
        if (bruto) falhar(`${p.nome} ${pauta.slug}: NAO_APLICAVEL com voto original`);
      } else {
        const canon = normalizarVoto(raw);
        if (bruto !== canon) falhar(`${p.nome} ${pauta.slug}: bruto ${bruto} ≠ ${canon}`);
        if (local !== aplicarInversao(canon, pauta.invertida)) {
          falhar(`${p.nome} ${pauta.slug}: alinhamento ${local} divergente`);
        }
        conferidos++;
      }
    } else if (emExercicio.has(id)) {
      if (local !== 'AUSENTE') falhar(`${p.nome} ${pauta.slug}: ausência local=${local}`);
      if (bruto !== 'AUSENTE') falhar(`${p.nome} ${pauta.slug}: ausência sem votosOriginais`);
      ausentes++;
    } else {
      if (local !== 'NAO_APLICAVEL') falhar(`${p.nome} ${pauta.slug}: fora do mandato local=${local}`);
      if (!p.motivos?.[pauta.slug]) falhar(`${p.nome} ${pauta.slug}: fora do mandato sem motivo`);
      if (bruto) falhar(`${p.nome} ${pauta.slug}: fora do mandato com voto original`);
      semVoto++;
    }
  }

  const conta = (alvo: string) =>
    [...api.values()].filter((v) => normalizarVoto(v) === alvo).length;
  const sim = conta('SIM');
  const nao = conta('NAO');
  const abst = conta('ABSTENCAO');
  const s = parsePlacar(pauta.resultadoCamara, /(\d+)\s*SIM/i);
  const n = parsePlacar(pauta.resultadoCamara, /(\d+)\s*N[ÃA]O/i);
  const a = parsePlacar(pauta.resultadoCamara, /(\d+)\s*ABST/i);
  if (s !== null && s !== sim) falhar(`${pauta.slug}: SIM placar ${s} ≠ painel ${sim}`);
  if (n !== null && n !== nao) falhar(`${pauta.slug}: NÃO placar ${n} ≠ painel ${nao}`);
  if (a !== null && a !== abst) falhar(`${pauta.slug}: ABST placar ${a} ≠ painel ${abst}`);
  if (abst > 0 && a === null) falhar(`${pauta.slug}: placar omite ${abst} abstenções`);

  ok(
    `${pauta.slug}: ${conferidos} votos conferidos, ${ausentes} ausências reais, ${semVoto} sem voto | painel ${sim}/${nao}/${abst}`,
  );
  await sleep(200);
}
async function validarSenado(pauta: PautaConfig, senadores: ParlamentarConsolidado[]) {
  const conf = pauta.senado;
  if (!conf || conf.status !== 'nominal') return;

  const dia = conf.dataSessao.replace(/-/g, '');
  const lista = await getJson<SenadoLista>(`${SEN}/plenario/lista/votacao/${dia}/${dia}`);
  const votacao = arr(lista.ListaVotacoes?.Votacoes?.Votacao).find(
    (v) => Number(v.CodigoSessaoVotacao) === conf.codigoSessaoVotacao,
  );
  if (!votacao) {
    falhar(`${pauta.slug}: votação ${conf.codigoSessaoVotacao} ausente no painel de ${conf.dataSessao}`);
    return;
  }

  const api = new Map<number, string>();
  for (const v of arr(votacao.Votos?.VotoParlamentar)) {
    api.set(Number(v.CodigoParlamentar), String(v.Voto ?? ''));
  }

  const codigoMateria = conf.urlMateria?.match(/materia\/(\d+)/)?.[1];
  if (codigoMateria) {
    const m = await getJson<SenadoMateria>(`${SEN}/materia/${codigoMateria}`);
    const id = m.DetalheMateria?.Materia?.IdentificacaoMateria;
    const sigla = id?.SiglaSubtipoMateria ?? id?.SiglaTipoMateria ?? '';
    const numero = id?.NumeroMateria ? Number(id.NumeroMateria) : NaN;
    const materia = id && Number.isFinite(numero) ? `${sigla} ${numero}/${id.AnoMateria}` : '';
    if (materia !== pauta.materia) {
      falhar(`${pauta.slug}: matéria do Senado ${materia} ≠ ${pauta.materia}`);
    }
  }

  let conferidos = 0;
  let ncom = 0;
  let semVoto = 0;
  for (const p of senadores) {
    const id = Number(p.id.slice('senado-'.length));
    const raw = api.get(id);
    const local = p.votos[pauta.slug];
    const bruto = p.votosOriginais?.[pauta.slug];

    if (raw === undefined) {
      if (local !== 'NAO_APLICAVEL') falhar(`${p.nome} ${pauta.slug}: sem registro local=${local}`);
      if (!p.motivos?.[pauta.slug]) falhar(`${p.nome} ${pauta.slug}: sem registro sem motivo`);
      if (bruto) falhar(`${p.nome} ${pauta.slug}: sem registro com voto original`);
      semVoto++;
      continue;
    }

    const status = statusNaoVotoSenado(raw);
    if (status) {
      if (status.ausente) {
        if (local !== 'AUSENTE') falhar(`${p.nome} ${pauta.slug}: NCom local=${local}`);
        if (bruto !== 'AUSENTE') falhar(`${p.nome} ${pauta.slug}: NCom sem votosOriginais`);
        ncom++;
      } else {
        if (local !== 'NAO_APLICAVEL') falhar(`${p.nome} ${pauta.slug}: ${raw} local=${local}`);
        if (bruto) falhar(`${p.nome} ${pauta.slug}: ${raw} com voto original`);
        semVoto++;
      }
      if (p.motivos?.[pauta.slug] !== status.motivo) {
        falhar(`${p.nome} ${pauta.slug}: motivo divergente para ${raw}`);
      }
      continue;
    }

    const canon = normalizarVotoSenado(raw);
    if (bruto !== canon) falhar(`${p.nome} ${pauta.slug}: bruto ${bruto} ≠ ${canon}`);
    if (local !== aplicarInversao(canon, pauta.invertida)) {
      falhar(`${p.nome} ${pauta.slug}: alinhamento ${local} divergente`);
    }
    conferidos++;
  }

  const conta = (alvo: string) =>
    [...api.values()].filter(
      (v) => !statusNaoVotoSenado(v) && normalizarVotoSenado(v) === alvo,
    ).length;
  const sim = conta('SIM');
  const nao = conta('NAO');
  const abst = conta('ABSTENCAO');
  const s = parsePlacar(pauta.resultadoSenado, /(\d+)\s*SIM/i);
  const n = parsePlacar(pauta.resultadoSenado, /(\d+)\s*N[ÃA]O/i);
  const a = parsePlacar(pauta.resultadoSenado, /(\d+)\s*ABST/i);
  if (s !== null && s !== sim) falhar(`${pauta.slug}: SIM Senado ${s} ≠ painel ${sim}`);
  if (n !== null && n !== nao) falhar(`${pauta.slug}: NÃO Senado ${n} ≠ painel ${nao}`);
  if (a !== null && a !== abst) falhar(`${pauta.slug}: ABST Senado ${a} ≠ painel ${abst}`);
  if (abst > 0 && a === null) falhar(`${pauta.slug}: placar do Senado omite ${abst} abstenções`);

  ok(
    `${pauta.slug} (Senado): ${conferidos} votos conferidos, ${ncom} NCom, ${semVoto} sem voto | painel ${sim}/${nao}/${abst}`,
  );
  await sleep(200);
}

async function validarRosters(dados: ParlamentarConsolidado[]) {
  const deputados = dados.filter((p) => p.cargo === 'DEPUTADO');
  const senadores = dados.filter((p) => p.cargo === 'SENADOR');

  const apiDep = await getJson<{ dados: CamaraRoster[] }>(`${API}/deputados?itens=1000`);
  const mapaDep = new Map(apiDep.dados.map((d) => [d.id, d]));
  for (const p of deputados) {
    const id = Number(p.id.slice('camara-'.length));
    const a = mapaDep.get(id);
    if (!a) {
      falhar(`deputado ${p.nome} (${p.partido}-${p.uf}) não está mais na Câmara`);
    } else if (a.nome !== p.nome || a.siglaPartido !== p.partido || a.siglaUf !== p.uf) {
      falhar(`deputado ${p.nome}: API ${a.nome} ${a.siglaPartido}/${a.siglaUf}`);
    }
  }
  if (deputados.length !== apiDep.dados.length) {
    falhar(`Câmara: JSON ${deputados.length} × API ${apiDep.dados.length}`);
  }

  const apiSen = await getJson<SenadoAtual>(`${SEN}/senador/lista/atual.json`);
  const listaSen = arr(apiSen.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar).map(
    (s) => s.IdentificacaoParlamentar,
  );
  const mapaSen = new Map(listaSen.map((s) => [Number(s.CodigoParlamentar), s]));
  for (const p of senadores) {
    const id = Number(p.id.slice('senado-'.length));
    const a = mapaSen.get(id);
    if (!a) {
      falhar(`senador ${p.nome} (${p.partido}-${p.uf}) não está mais em exercício`);
    } else if (
      a.NomeParlamentar !== p.nome ||
      a.SiglaPartidoParlamentar !== p.partido ||
      a.UfParlamentar !== p.uf
    ) {
      falhar(`senador ${p.nome}: API ${a.NomeParlamentar} ${a.SiglaPartidoParlamentar}/${a.UfParlamentar}`);
    }
  }
  if (senadores.length !== listaSen.length) {
    falhar(`Senado: JSON ${senadores.length} × API ${listaSen.length}`);
  }

  ok(`Rosters conferidos: ${deputados.length} deputados + ${senadores.length} senadores`);
}

async function validarLinks(pauta: PautaConfig) {
  const urls = [
    pauta.urlNorma,
    pauta.urlNormaRevogadora,
    pauta.senado?.urlMateria,
    pauta.urlMateriaRevogadora,
  ].filter((u): u is string => Boolean(u));

  for (const url of urls) {
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (r.status >= 400) falhar(`link ${url}: HTTP ${r.status}`);
    } catch (e) {
      if (url.includes('planalto.gov.br')) {
        console.warn(`⚠️  link do Planalto não verificável por HEAD: ${url}`);
      } else {
        falhar(`link ${url}: ${String(e)}`);
      }
    }
  }
}

async function main(): Promise<void> {
  const dados = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8')) as ParlamentarConsolidado[];
  const deputados = dados.filter((p) => p.cargo === 'DEPUTADO');
  const senadores = dados.filter((p) => p.cargo === 'SENADOR');

  if (dados.length !== 594) falhar(`esperados 594 parlamentares, encontrados ${dados.length}`);
  if (deputados.length !== 513) falhar(`esperados 513 deputados, encontrados ${deputados.length}`);
  if (senadores.length !== 81) falhar(`esperados 81 senadores, encontrados ${senadores.length}`);

  await validarRosters(dados);

  for (const pauta of PAUTAS) {
    if (pauta.casa === 'CAMARA') await validarCamara(pauta, deputados);
    await validarSenado(pauta, senadores);
    await validarLinks(pauta);
  }

  if (falhas.length > 0) {
    console.error(`\n❌ ${falhas.length} divergência(s) encontrada(s).`);
    process.exit(1);
  }
  console.log('\n✅ Validação completa: roster, votos, placares, matérias e links conferidos.');
}

main().catch((e) => {
  console.error('\n❌ Validação abortada:', e);
  process.exit(1);
});