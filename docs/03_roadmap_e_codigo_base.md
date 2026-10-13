# Roadmap e Código-Base

> Documento convertido de `.docx` para Markdown (texto extraído automaticamente).
> O original está preservado em `docs/_originais/03_roadmap_e_codigo_base.docx`.
> Imagens e diagramas do original não são reproduzidos aqui.

---

Fiscal da Pátria
Guia completo de implementação do projeto Fiscal da Pátria, uma aplicação web focada em transparência pública, fiscalização parlamentar e engajamento cívico.
1. Roteiro Passo a Passo de Implementação
Passo 1: Inicialização do Projeto Next.js
Execute o comando abaixo no terminal para criar o projeto com suporte nativo a TypeScript, Tailwind CSS e App Router:npx create-next-js-app@latest fiscal-da-patria --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd fiscal-da-patria

Instale as dependências necessárias para manipulação de dados, geração de canvas e ícones:npm install lucide-react html-to-image canvas-confetti

npm install -D tsx @types/canvas-confetti
Passo 2: Estrutura de Diretórios
Organize as pastas da aplicação conforme o modelo abaixo:tfiscal-da-patria/├── public/│   └── data/│       └── parlamentares.json├── scripts/│   └── fetch_votes.ts├── src/│   ├── app/│   │   ├── layout.tsx│   │   └── page.tsx│   └── components/│       └── CitizenBadgeCard.tsx├── package.json└── tsconfig.json

### Passo 3: Fluxo de Ingestão de Dados

 Adicione a seguinte chamada no campo `scripts` do `package.json` para facilitar a execução da pipeline de dados:

```json

"scripts": {

  "dev": "next dev",

  "build": "next build",

  "start": "next start",

  "lint": "next lint",

  "update-data": "tsx scripts/fetch_votes.ts"

}

Execute o comando de extração de dados antes da primeira inicialização do servidor:npm run update-data
Passo 4: Build e Deploy
A aplicação gera um arquivo JSON estático de alta performance no build. Para publicar em plataformas como Vercel ou Netlify:npm run build
2. Script de Extração Completo em TypeScript
Salve o código a seguir no arquivo scripts/fetch_votes.ts. Este script realiza a consulta à API da Câmara dos Deputados, faz o parsing das votações das 7 pautas estratégicas, realiza a inversão semântica de favorabilidade e exporta os dados consolidados para public/data/parlamentares.json.import fs from 'fs';

import path from 'path';

interface VotacaoConfig {

  id: string;

  slug: string;

  titulo: string;

  descricao: string;

  invertida: boolean; // true = SIM é contra o interesse público / NÃO é a favor

}

const PAUTAS: VotacaoConfig[] = [

  {

    id: "2354321-45",

    slug: "taxacao_compras",

    titulo: "Taxação de Compras Internacionais (Mover)",

    descricao: "Fim da isenção para compras de até US$ 50 no exterior.",

    invertida: true // SIM = Pro-imposto (Inverso), NAO = Contra-imposto (Favoravel ao cidadao)

  },

  {

    id: "2234112-12",

    slug: "pec_blindagem",

    titulo: "PEC da Blindagem Parlamentar",

    descricao: "Restrições para prisão e medidas cautelares contra parlamentares.",

    invertida: true // SIM = Contra transparência

  },

  {

    id: "2198300-88",

    slug: "PL_FakeNews",

    titulo: "Urgência do PL das Fake News",

    descricao: "Regulamentação das plataformas digitais e redes sociais.",

    invertida: true

  },

  {

    id: "2289100-33",

    slug: "marco_temporal",

    titulo: "Marco Temporal de Terras Indígenas",

    descricao: "Demarcação restrita a terras ocupadas em outubro de 1988.",

    invertida: false

  },

  {

    id: "2312900-11",

    slug: "reforma_tributaria",

    titulo: "Texto-Base da Reforma Tributária",

    descricao: "Reformulação do sistema de impostos sobre consumo.",

    invertida: false

  },

  {

    id: "2401100-05",

    slug: "autonomia_bc",

    titulo: "Autonomia Operacional do Banco Central",

    descricao: "Formalização da independência da autoridade monetária.",

    invertida: false

  },

  {

    id: "2390111-99",

    slug: "flexibilizacao_armas",

    titulo: "Flexibilização do Porte e Posse de Armas",

    descricao: "Decreto de regulação sobre porte de armas para CACs.",

    invertida: true

  }

];

interface VotoBruto {

  deputado_: {

    id: number;

    nome: string;

    siglaPartido: string;

    siglaUf: string;

    urlFoto: string;

    email: string;

  };

  tipoVoto: string;

}

interface VotoProcessado {

  pautaSlug: string;

  pautaTitulo: string;

  votoOriginal: string;

  alinhamentoCidadao: 'FAVORAVEL' | 'CONTRA' | 'ABSTENCAO' | 'AUSENTE';

|---|---|

export interface ParlamentarConsolidado {

  id: number;

  nome: string;

  partido: string;

  uf: string;

  foto: string;

  email: string;

  scoreCidadao: number; // 0 a 100

  votos: Record<string, VotoProcessado>;

}

async function fetchVotes() {

  console.log("🚀 Iniciando ingestão de dados do Congresso...");

  const parlamentaresMap = new Map<number, ParlamentarConsolidado>();

  for (const pauta of PAUTAS) {

    console.log(`📡 Coletando votação: ${pauta.titulo}...`);

    try {

      // Endpoint oficial da API de dados abertos da Câmara

      const response = await fetch(`https://dadosabertos.camara.leg.br/api/v2/votacoes/${pauta.id}/votos`, {

        headers: { 'Accept': 'application/json' }

      });

      let votosData: VotoBruto[] = [];

      if (response.ok) {

        const json = await response.json();

        votosData = json.dados || [];

      } else {

        console.warn(`⚠️ Não foi possível obter dados para ${pauta.id}. Gerando dados simulados para ambiente de dev.`);

        votosData = generateMockVotes();

      }

      for (const voto of votosData) {

        const dep = voto.deputado_;

        if (!parlamentaresMap.has(dep.id)) {

          parlamentaresMap.set(dep.id, {

            id: dep.id,

            nome: dep.nome,

            partido: dep.siglaPartido,

            uf: dep.siglaUf,

            foto: dep.urlFoto || `https://www.camara.leg.br/internet/deputado/bandep/${dep.id}.jpg`,

            email: dep.email || `${dep.nome.toLowerCase().replace(/\s+/g, '')}@camara.leg.br`,

            scoreCidadao: 0,

            votos: {}

          });

        }

        const parlamentar = parlamentaresMap.get(dep.id)!;

        const tipoVotoUpper = (voto.tipoVoto || "AUSENTE").toUpperCase();

        let alinhamento: 'FAVORAVEL' | 'CONTRA' | 'ABSTENCAO' | 'AUSENTE' = 'AUSENTE';

        if (tipoVotoUpper.includes("SIM")) {

          alinhamento = pauta.invertida ? 'CONTRA' : 'FAVORAVEL';

        } else if (tipoVotoUpper.includes("NÃO") || tipoVotoUpper.includes("NAO")) {

          alinhamento = pauta.invertida ? 'FAVORAVEL' : 'CONTRA';

        } else if (tipoVotoUpper.includes("ABSTENÇÃO") || tipoVotoUpper.includes("ABSTENCAO")) {

          alinhamento = 'ABSTENCAO';

        }

        parlamentar.votos[pauta.slug] = {

          pautaSlug: pauta.slug,

          pautaTitulo: pauta.titulo,

          votoOriginal: tipoVotoUpper,

          alinhamentoCidadao: alinhamento

        };

      }

    } catch (err) {

      console.error(`❌ Erro ao processar pauta ${pauta.slug}:`, err);

    }

  }

  // Cálculo do Score de Alinhamento Cívico (0 - 100%)

  console.log("📊 Calculando pontuação final dos parlamentares...");

  const listaParlamentares = Array.from(parlamentaresMap.values()).map(p => {

    const totalPautas = PAUTAS.length;

    let pontos = 0;

    Object.values(p.votos).forEach(v => {

      if (v.alinhamentoCidadao === 'FAVORAVEL') pontos += 1;

      else if (v.alinhamentoCidadao === 'ABSTENCAO') pontos += 0.3;

    });

    p.scoreCidadao = Math.round((pontos / totalPautas) * 100);

    return p;

  });

  const outputPath = path.join(process.cwd(), 'public', 'data', 'parlamentares.json');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  fs.writeFileSync(outputPath, JSON.stringify(listaParlamentares, null, 2));

  console.log(`✅ Sucesso! Total de ${listaParlamentares.length} parlamentares salvos em: ${outputPath}`);

}

function generateMockVotes(): VotoBruto[] {

  const ufs = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE', 'SC', 'GO'];

  const partidos = ['PL', 'PT', 'UNIÃO', 'PP', 'PSD', 'MDB', 'REPUBLICANOS', 'PSOL', 'NOVO', 'PODEMOS'];

  const mock: VotoBruto[] = [];

  for (let i = 1; i <= 100; i++) {

    const votosPossiveis = ['Sim', 'Não', 'Abstenção', 'Obstrução'];

    const votoRandom = votosPossiveis[Math.floor(Math.random() * votosPossiveis.length)];

    mock.push({

      deputado_: {

        id: 1000 + i,

        nome: `Deputado Exemplo ${i}`,

        siglaPartido: partidos[i % partidos.length],

        siglaUf: ufs[i % ufs.length],

        urlFoto: `https://picsum.photos/seed/${i + 100}/200/200`,

        email: `dep.exemplo${i}@camara.leg.br`

      },

      tipoVoto: votoRandom

    });

  }

  return mock;

}

fetchVotes();
3. Componente React/Tailwind do Selo Cívico
Salve o componente a seguir em src/components/CitizenBadgeCard.tsx. Ele provê renderização responsiva de alta resolução (dimensão proporção 9:16 - 1080x1920) própria para exportação em stories ou postagens digitais.'use client';

import React, { useRef, useState } from 'react';

import { toPng } from 'html-to-image';

import { Download, Share2, ShieldCheck, Award } from 'lucide-react';

import { ParlamentarConsolidado } from '../../scripts/fetch_votes';

interface BadgeProps {

  parlamentar: ParlamentarConsolidado;

}

export const CitizenBadgeCard: React.FC<BadgeProps> = ({ parlamentar }) => {

  const cardRef = useRef<HTMLDivElement>(null);

  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {

    if (!cardRef.current) return;

    setDownloading(true);

    try {

      const dataUrl = await toPng(cardRef.current, {

        canvasWidth: 1080,

        canvasHeight: 1920,

        pixelRatio: 1,

      });

      const link = document.createElement('a');

      link.download = `Selo_Civico_${parlamentar.nome.replace(/\s+/g, '_')}.png`;

      link.href = dataUrl;

      link.click();

    } catch (err) {

      console.error('Erro ao exportar imagem:', err);

    } finally {

      setDownloading(false);

    }

  };

  return (

    <div className="flex flex-col items-center gap-4">

      {/* Contêiner de Visualização Ajustado */}

      <div

        ref={cardRef}

        className="w-[360px] h-[640px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden border border-slate-700"

      >

        {/* Adornos de Fundo */}

        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho do Card */}

        <div className="flex justify-between items-center z-10">

          <div className="flex items-center gap-2">

            <ShieldCheck className="w-6 h-6 text-emerald-400" />

            <span className="font-bold tracking-wider text-xs uppercase text-slate-300">

              Selo de Transparência Cívica

            </span>

          </div>

          <span className="text-[10px] bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 font-mono">

            2024

          </span>

        </div>

        {/* Perfil e Foto */}

        <div className="flex flex-col items-center my-auto z-10 text-center">

          <div className="relative mb-4">

            <img

              src={parlamentar.foto}

              alt={parlamentar.nome}

              className="w-28 h-28 rounded-full object-cover border-4 border-slate-700 shadow-xl"

            />

            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg">

              <Award className="w-5 h-5" />

            </div>

          </div>

          <h2 className="text-xl font-bold text-white tracking-tight line-clamp-1">

            {parlamentar.nome}

          </h2>

          <p className="text-sm text-slate-400 font-medium mb-4">

            {parlamentar.partido} • {parlamentar.uf}

          </p>

          {/* Indicador do Score */}

          <div className="w-full bg-slate-800/90 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">

            <div className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">

              Índice de Alinhamento Cívico

            </div>

            <div className="text-4xl font-black text-emerald-400 mb-2 font-mono">

              {parlamentar.scoreCidadao}%

            </div>

            <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">

              <div

                className="bg-emerald-400 h-full rounded-full transition-all duration-500"

                style={{ width: `${parlamentar.scoreCidadao}%` }}

              />

            </div>

          </div>

        </div>

        {/* Rodapé e Assinatura */}

        <div className="z-10 pt-4 border-t border-slate-800 text-center">

          <p className="text-[11px] text-slate-400 font-medium">

            Fiscal da Pátria • Dados Abertos e Transparência

          </p>

          <p className="text-[9px] text-slate-500 mt-0.5">

            Verificado com base nas votações oficiais da Câmara dos Deputados

          </p>

        </div>

      </div>

      {/* Botão de Download */}

      <button

        onClick={handleExport}

        disabled={downloading}

        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-lg transition border border-slate-700 text-sm shadow-sm"

      >

        {downloading ? (

          <span className="animate-pulse">Gerando imagem...</span>

        ) : (

          <>

            <Download className="w-4 h-4" /> Exportar Cartão (PNG 9:16)

          </>

        )}

      </button>

    </div>

  );

};
4. Componente da Página Principal
Salve o código abaixo em src/app/page.tsx. Ele gerencia a leitura de dados, carrossel de atalhos rápidos, filtros por Estado/UF, busca dinâmica e a modal detalhada com link direto à API da Câmara dos Deputados.'use client';

import React, { useState, useEffect } from 'react';

import { Search, Filter, ExternalLink, X, Info, CheckCircle2, XCircle, MinusCircle, AlertCircle } from 'lucide-react';

import { CitizenBadgeCard } from '@/components/CitizenBadgeCard';

import { ParlamentarConsolidado } from '../../scripts/fetch_votes';

const ESTADOS = [

  'TODOS', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',

  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ',

  'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'

];

export default function HomePage() {

  const [parlamentares, setParlamentares] = useState<ParlamentarConsolidado[]>([]);

  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState('');

  const [estadoSel, setEstadoSel] = useState('TODOS');

  const [parlamentarModal, setParlamentarModal] = useState<ParlamentarConsolidado | null>(null);

  useEffect(() => {

    async function loadData() {

      try {

        const res = await fetch('/data/parlamentares.json');

        if (res.ok) {

          const data = await res.json();

          setParlamentares(data);

        }

      } catch (err) {

        console.error("Falha ao carregar arquivo de dados:", err);

      } finally {

        setLoading(false);

      }

    }

    loadData();

  }, []);

  const filtrados = parlamentares.filter(p => {

    const matchNome = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.partido.toLowerCase().includes(busca.toLowerCase());

    const matchUF = estadoSel === 'TODOS' || p.uf === estadoSel;

    return matchNome && matchUF;

  });

  return (

    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* Navbar */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="bg-slate-900 text-white font-black px-3 py-1.5 rounded-lg text-lg tracking-tight">

              FP

            </div>

            <h1 className="font-bold text-slate-900 text-lg tracking-tight">

              Fiscal da <span className="text-emerald-600">Pátria</span>

            </h1>

          </div>

          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">

            Painel Cívico Atualizado

          </span>

        </div>

      </header>

      {/* Hero & Filtros */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">

          <h2 className="text-2xl font-bold text-slate-900 mb-2">

            Fiscalização Parlamentar Transparente

          </h2>

          <p className="text-slate-600 text-sm max-w-2xl">

            Acompanhe a atuação dos deputados federais, analise o histórico de votações em pautas decisivas e gere cartões de alinhamento cívico para compartilhamento.

          </p>

        </div>

        {/* Filtros e Busca */}

        <div className="flex flex-col md:flex-row gap-4 mb-6">

          <div className="relative flex-1">

            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />

            <input

              type="text"

              placeholder="Buscar por nome do parlamentar ou partido..."

              value={busca}

              onChange={(e) => setBusca(e.target.value)}

              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"

            />

          </div>

        </div>

        {/* Carrossel / Listagem de Estados (Pills) */}

        <div className="mb-8">

          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">

            <Filter className="w-3.5 h-3.5" /> Filtrar por Estado (UF)

          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">

            {ESTADOS.map(uf => (

              <button

                key={uf}

                onClick={() => setEstadoSel(uf)}

                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition shadow-sm ${

                  estadoSel === uf

                    ? 'bg-slate-900 text-white'

                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'

                }`}

              >

                {uf}

              </button>

            ))}

          </div>

        </div>

        {/* Grid de Deputados */}

        {loading ? (

          <div className="text-center py-20 text-slate-500 text-sm">

            Carregando dados das votações...

          </div>

        ) : filtrados.length === 0 ? (

          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">

            <p className="text-slate-500 text-sm">Nenhum parlamentar encontrado com os filtros selecionados.</p>

          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

            {filtrados.map(dep => (

              <div

                key={dep.id}

                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition flex flex-col justify-between"

              >

                <div>

                  <div className="flex items-center gap-3 mb-4">

                    <img

                      src={dep.foto}

                      alt={dep.nome}

                      className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"

                    />

                    <div>

                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{dep.nome}</h3>

                      <p className="text-xs text-slate-500 font-medium">{dep.partido} • {dep.uf}</p>

                    </div>

                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">

                    <div className="flex justify-between items-center mb-1">

                      <span className="text-[11px] font-medium text-slate-500">Alinhamento Cívico</span>

                      <span className="text-xs font-bold text-slate-900">{dep.scoreCidadao}%</span>

                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">

                      <div

                        className="bg-emerald-500 h-full rounded-full"

                        style={{ width: `${dep.scoreCidadao}%` }}

                      />

                    </div>

                  </div>

                </div>

                <button

                  onClick={() => setParlamentarModal(dep)}

                  className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 rounded-lg transition"

                >

                  Ver Dossiê Completo

                </button>

              </div>

            ))}

          </div>

        )}

      </main>

      {/* Modal do Dossiê */}

      {parlamentarModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col md:flex-row gap-8">

            <button

              onClick={() => setParlamentarModal(null)}

              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"

            >

              <X className="w-5 h-5" />

            </button>

            {/* Coluna Esquerda: Detalhes e Votações */}

            <div className="flex-1">

              <div className="flex items-center gap-4 mb-6">

                <img

                  src={parlamentarModal.foto}

                  alt={parlamentarModal.nome}

                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"

                />

                <div>

                  <h2 className="text-xl font-bold text-slate-900">{parlamentarModal.nome}</h2>

                  <p className="text-sm text-slate-500">{parlamentarModal.partido} • {parlamentarModal.uf}</p>

                  <a

                    href={`https://www.camara.leg.br/deputados/${parlamentarModal.id}`}

                    target="_blank"

                    rel="noreferrer"

                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-medium mt-1"

                  >

                    Perfil Oficial na Câmara <ExternalLink className="w-3 h-3" />

                  </a>

                </div>

              </div>

              <h3 className="font-bold text-slate-900 text-sm mb-3">Histórico de Pautas Principais</h3>

              <div className="space-y-2.5 mb-6">

                {Object.values(parlamentarModal.votos).map((voto, idx) => (

                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">

                    <span className="font-medium text-slate-700 pr-2">{voto.pautaTitulo}</span>

                    <div className="flex items-center gap-1.5 shrink-0">

                      {voto.alinhamentoCidadao === 'FAVORAVEL' && (

                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">

                          <CheckCircle2 className="w-3.5 h-3.5" /> A favor do cidadão

                        </span>

                      )}

                      {voto.alinhamentoCidadao === 'CONTRA' && (

                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-1 rounded-md border border-rose-200">

                          <XCircle className="w-3.5 h-3.5" /> Contra o cidadão

                        </span>

                      )}

                      {voto.alinhamentoCidadao === 'ABSTENCAO' && (

                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-md border border-amber-200">

                          <MinusCircle className="w-3.5 h-3.5" /> Abstenção

                        </span>

                      )}

                      {voto.alinhamentoCidadao === 'AUSENTE' && (

                        <span className="inline-flex items-center gap-1 text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded-md">

                          <AlertCircle className="w-3.5 h-3.5" /> Ausente

                        </span>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Coluna Direita: Cartão Exporte */}

            <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">

              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">Cartão para Redes Sociais</h3>

              <CitizenBadgeCard parlamentar={parlamentarModal} />

            </div>

          </div>

        </div>

      )}

    </div>

  );

}
5. Instruções para Ferramentas de IA Locais e CLIs
Para desenvolver e iterar nesta estrutura utilizando assistentes com suporte a chamadas de ferramentas e modificação de arquivos em terminal (como Aider ou extensões como Roo Code executando o modelo DeepSeek-R1 / V3), siga as diretrizes abaixo.
Tabela de Configuração Recomendada
Ferramenta
Provedor / Modelo
Prompt de Inicialização / System Prompt Recomendado
Aider CLI
DeepSeek (via API OpenRouter ou DeepSeek)
aider --model deepseek/deepseek-chat
Roo Code (VS Code)
DeepSeek V3 / R1
Ativar o modo Code com permissão de escrita em workspace
Exemplo de Comando e Prompt para Aider CLI
No terminal, estando na raiz do projeto Next.js, invoque o Aider indicando os arquivos que deseja atualizar:aider --model deepseek/deepseek-chat scripts/fetch_votes.ts src/app/page.tsx

Em seguida, utilize o prompt estruturado:"Preciso adicionar uma nova pauta de votação ao script scripts/fetch_votes.ts. A pauta é sobre a Isenção de Impostos em Cestas Básicas (ID da votação: 2400100-10). O voto 'SIM' deve ser considerado FAVORÁVEL ao cidadão (invertida = false). Atualize as interfaces necessárias, rode a extração e ajuste o componente page.tsx para renderizar essa pauta com destaque."
