/**
 * Extrai os votos oficiais das urnas (TSE) para **deputados e senadores**.
 *
 * Fonte oficial: TSE — Repositório de Dados Eleitorais
 *   `votacao_candidato_munzona_{ANO}_{UF}.csv` (dos zips oficiais de 2018 e 2022).
 *
 * Por que dois anos: o Senado renova 1/3 e 2/3 alternadamente — quem foi eleito
 * em 2018 (2/3 da Casa) não aparece no arquivo de 2022. Usamos o pleito mais
 * recente em que cada parlamentar apareceu.
 *
 * Robustez: os índices das colunas são descobertos **pelo cabeçalho** (o leiaute
 * muda entre anos), nunca por posição fixa. Encoding ISO-8859-1, separador ';'.
 *
 * Saída: `scripts/data/tse_votos_urnas.json`
 *   mapa: "CARGO|NOME|UF" (sem acento, MAIÚSCULAS) → votos nominais do pleito escolhido.
 *
 * Uso:
 *   1) baixe/extraia os zips em `scripts/data/temp/2018` e `.../2022`
 *   2) `npm run fetch-tse`
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const TEMP = path.join(process.cwd(), 'scripts', 'data', 'temp');
const SAIDA = path.join(process.cwd(), 'scripts', 'data', 'tse_votos_urnas.json');
const SENADO = path.join(process.cwd(), 'scripts', 'data', 'senadores_consolidados.json');
const API_CAMARA = 'https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000';

const ANOS = [2018, 2022];
const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

interface Alvo {
  cargo: 'DEPUTADO' | 'SENADOR';
  uf: string;
  /** "CARGO|NOME|UF" — chave final do mapa. */
  nChave: string;
}

const semAspas = (v: string) => (v ?? '').replace(/^"|"$/g, '');
const norm = (texto: string) =>
  (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();

const chave = (cargo: string, nome: string, uf: string) => `${cargo}|${norm(nome)}|${norm(uf)}`;

/** Descobre o índice de cada coluna pelo cabeçalho do CSV do TSE (o leiaute muda entre anos). */
function indexarColunas(cabecalho: string[]): Record<string, number> {
  const limpo = cabecalho.map((c) => semAspas(c).trim());
  const achar = (nomes: string[]) => {
    for (const n of nomes) {
      const i = limpo.indexOf(n);
      if (i >= 0) return i;
    }
    return -1;
  };

  const idx: Record<string, number> = {};
  const colunas: Array<[string, string[]]> = [
    ['SG_UF', ['SG_UF']],
    ['DS_CARGO', ['DS_CARGO']],
    ['NM_CANDIDATO', ['NM_CANDIDATO']],
    // 2018 usa NM_URNA_CANDIDATO; o arquivo de 2022 traz NM_URNA.
    ['NM_URNA', ['NM_URNA', 'NM_URNA_CANDIDATO']],
    ['QT_VOTOS', ['QT_VOTOS', 'QT_VOTOS_NOMINAIS']],
  ];
  for (const [chave, nomes] of colunas) {
    const i = achar(nomes);
    if (i < 0 && chave !== 'NM_URNA') {
      throw new Error(`Coluna ${chave} ausente no cabeçalho do TSE — abortando.`);
    }
    idx[chave] = i;
  }
  return idx;
}

/** Alvos: 513 deputados em exercício (Câmara) + senadores em exercício (Senado). */
async function carregarAlvos(): Promise<{ alvos: Alvo[]; porNome: Map<string, Alvo> }> {
  const res = await fetch(API_CAMARA, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Câmara HTTP ${res.status} — abortando.`);
  const json = (await res.json()) as { dados: Array<{ nome: string; siglaUf: string }> };

  const alvos: Alvo[] = json.dados.map((d) => {
    const cargo = 'DEPUTADO' as const;
    return { cargo, uf: d.siglaUf, nChave: chave(cargo, d.nome, d.siglaUf) };
  });

  if (fs.existsSync(SENADO)) {
    const sen = JSON.parse(fs.readFileSync(SENADO, 'utf-8')) as {
      senadores: Array<{ nome: string; uf: string }>;
    };
    for (const s of sen.senadores) {
      alvos.push({ cargo: 'SENADOR', uf: s.uf, nChave: chave('SENADOR', s.nome, s.uf) });
    }
  } else {
    console.warn('⚠️  senadores_consolidados.json ausente — rode `npm run fetch-senado` antes.');
  }

  const porNome = new Map<string, Alvo>();
  for (const a of alvos) porNome.set(`${a.cargo}|${a.nChave.split('|')[1]}|${norm(a.uf)}`, a);
  return { alvos, porNome };
}

/** Lê um CSV por UF do TSE e acumula os votos dos alvos no ano informado. */
async function lerCsv(
  arquivo: string,
  ano: number,
  porNome: Map<string, Alvo>,
  votos: Map<string, Record<number, number>>,
): Promise<number> {
  const rl = readline.createInterface({
    input: fs.createReadStream(arquivo, { encoding: 'latin1' }),
    crlfDelay: Infinity,
  });

  let idx: Record<string, number> | null = null;
  let aproveitadas = 0;

  for await (const linha of rl) {
    const c = linha.split(';');
    if (!idx) {
      idx = indexarColunas(c);
      continue;
    }
    if (c.length <= idx.QT_VOTOS) continue;

    const cargoTse = semAspas(c[idx.DS_CARGO]).trim();
    const cargo = cargoTse.startsWith('Senador')
      ? 'SENADOR'
      : cargoTse.startsWith('Deputado Federal')
        ? 'DEPUTADO'
        : null;
    if (!cargo) continue;

    const uf = semAspas(c[idx.SG_UF]);
    if (!UFS.includes(uf)) continue;

    const votosNominais = Number.parseInt(semAspas(c[idx.QT_VOTOS]), 10) || 0;
    if (votosNominais <= 0) continue;

    const candidatos = [semAspas(c[idx.NM_URNA] ?? ''), semAspas(c[idx.NM_CANDIDATO])].filter(
      (n) => n.length > 0,
    );
    const alvo = candidatos
      .map((n) => porNome.get(`${cargo}|${norm(n)}|${norm(uf)}`))
      .find((a) => a !== undefined);
    if (!alvo) continue;

    const porAno = votos.get(alvo.nChave) ?? {};
    porAno[ano] = (porAno[ano] ?? 0) + votosNominais;
    votos.set(alvo.nChave, porAno);
    aproveitadas++;
  }

  return aproveitadas;
}

async function main(): Promise<void> {
  const { alvos, porNome } = await carregarAlvos();
  const dep = alvos.filter((a) => a.cargo === 'DEPUTADO');
  const sen = alvos.filter((a) => a.cargo === 'SENADOR');
  console.log(`🎯 Alvos: ${alvos.length} parlamentares (${dep.length} deputados + ${sen.length} senadores)`);

  const votos = new Map<string, Record<number, number>>();

  for (const ano of ANOS) {
    console.log(`\n📂 TSE ${ano}`);
    for (const uf of UFS) {
      const arquivo = path.join(TEMP, String(ano), `votacao_candidato_munzona_${ano}_${uf}.csv`);
      if (!fs.existsSync(arquivo)) {
        console.warn(`   ⚠️  ausente: ${uf}`);
        continue;
      }
      const n = await lerCsv(arquivo, ano, porNome, votos);
      if (n > 0) console.log(`   ${uf}: ${n} linha(s) aproveitada(s)`);
    }
  }

  // Pleito mais recente em que o parlamentar apareceu com votos.
  const mapa: Record<string, number> = {};
  const pleitoUsado: Record<string, number> = {};
  for (const [k, porAno] of votos) {
    const anos = Object.keys(porAno)
      .map(Number)
      .filter((a) => (porAno[a] ?? 0) > 0)
      .sort((a, b) => b - a);
    if (anos.length === 0) continue;
    mapa[k] = porAno[anos[0]];
    pleitoUsado[k] = anos[0];
  }

  const ordenado = Object.fromEntries(
    Object.entries(mapa).sort((a, b) => b[1] - a[1]),
  ) as Record<string, number>;

  const cobertura = (lista: Alvo[]) => lista.filter((a) => mapa[a.nChave] !== undefined).length;

  fs.writeFileSync(
    SAIDA,
    JSON.stringify(
      {
        _fonte:
          'TSE — Repositório de Dados Eleitorais — votação nominal por município e zona (pleitos 2018 e 2022).',
        _metodo:
          'Chave "CARGO|NOME|UF" (nome de urna ou civil, sem acento, MAIÚSCULAS). Para cada parlamentar é usado o pleito mais recente em que apareceu com votos — nada é estimado.',
        _geradoEm: new Date().toISOString(),
        _cobertura: {
          deputados: `${cobertura(dep)}/${dep.length}`,
          senadores: `${cobertura(sen)}/${sen.length}`,
        },
        _pleitoUsado: pleitoUsado,
        mapa: ordenado,
      },
      null,
      2,
    ) + '\n',
    'utf-8',
  );

  console.log(`\n✅ ${Object.keys(mapa).length} parlamentares com votos do TSE → ${SAIDA}`);
  console.log(`   deputados: ${cobertura(dep)}/${dep.length} | senadores: ${cobertura(sen)}/${sen.length}`);
  console.log('   mais votados:');
  for (const [k, v] of Object.entries(ordenado).slice(0, 6)) {
    console.log(`     ${k} = ${v.toLocaleString('pt-BR')}`);
  }
}

main().catch((err) => {
  console.error('❌ Falha ao extrair votos do TSE:', err);
  process.exit(1);
});
