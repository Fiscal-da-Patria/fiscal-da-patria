# Arquitetura, Deploy e Infraestrutura

> Documento convertido de `.docx` para Markdown (texto extraído automaticamente).
> O original está preservado em `docs/_originais/02_arquitetura_e_infra.docx`.
> Imagens e diagramas do original não são reproduzidos aqui.

---

Fiscal da Pátria
Especificação Técnica de Arquitetura, Deploy, Caching e Infraestrutura
Este documento detalha a arquitetura técnica de alto desempenho para o Fiscal da Pátria, focando em custo operacional zero, resiliência extrema a picos de tráfego de alta viralidade e entrega otimizada em redes móveis e plataformas de dark social.

1. Stack Tecnológica Recomendada
A escolha dos componentes prioriza compilação estática, processamento build-time e footprint de runtime virtualmente nulo no servidor.

Componente
Tecnologia
Função e Justificativa
Framework Base
Next.js (App Router)
Roteamento baseado em sistema de arquivos, otimização automática de assets e geração de páginas estáticas via SSG (Static Site Generation).
Linguagem
TypeScript
Garantia de segurança de tipos, contratos estritos de dados para arquivos JSON estáticos e manutenção simplificada.
Estilização
Tailwind CSS
Utility-first CSS com purge agressivo em tempo de compilação, garantindo um bundle final de CSS inferior a 15KB.
Iconografia
Lucide React
Biblioteca de ícones tree-shakeable, importando estritamente os SVGs utilizados sem impacto adicional ao bundle.
Processamento de Imagem
Sharp / @vercel/og
Redimensionamento e conversão de fotos dos parlamentares para WebP/AVIF na build; geração estática de imagens OpenGraph de alto impacto.
Geração Gráfica
Canvas API / HTML Canvas
Renderização client-side de cartões interativos de votação e infográficos para compartilhamento direto pelo usuário.

2. Estratégia de Deploy Global com Custo Zero
A infraestrutura foi desenhada para operar 100% dentro do nível gratuito (Free Tier) de provedores serverless e CDNs globais.

[ Usuário Final / Dark Social ]

              │

              ▼

    [ Cloudflare Edge CDN ]  <─── DNS, WAF, DDoS Protection, TLS 1.3

              │

              ▼

  [ Vercel / Cloudflare Pages ] <─── Static Assets & Pre-rendered Pages

Hospedagem Primária: Cloudflare Pages ou Vercel Free Tier. Ambas oferecem largura de banda ilimitada ou extremamente generosa para arquivos estáticos, sem cobrança por requisições HTTP estáticas.
Gerenciamento de DNS & Edge: Cloudflare (Free Plan). Atua como proxy reverso global, fornecendo terminação TLS na borda, suporte a HTTP/3 e otimização de rotas via rede Anycast.
Orquestração de Deploy: Triggers automáticos a partir do repositório GitHub via Webhooks. O processo de build é executado inteiramente na infraestrutura do provedor de CI/CD sem consumo de recursos próprios.

3. Estratégia Robusta de Caches e Otimização Extrema
Para suportar milhões de acessos simultâneos sem estourar limites de execução serverless ou banco de dados, o sistema adota uma arquitetura Zero Database em Runtime.
3.1 Arquitetura Static JSON via CDN
Toda a base de dados de deputados, votações e proposições é compilada durante a build para arquivos .json estáticos e otimizados, hospedados diretamente na CDN.
O cliente realiza queries localmente em memória (Client-side Data Fetching & Filtering) via arquivos de índice compactados.
3.2 Políticas de Cache-Control
# Assets Imutáveis (JS, CSS, Imagens processadas)

Cache-Control: public, max-age=31536000, immutable

# Arquivos de Dados JSON e Páginas Estáticas

Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800

# OpenGraph Dynamic Images

Cache-Control: public, max-age=604800, s-maxage=2592000
3.3 Garantia de Escalabilidade
Custo Zero em Pico: Como a requisição não executa código de backend (Node.js/Edge Function) após a compilação, o custo por requisição adicional é exatamente zero.
Fallback Gracioso: O parâmetro stale-while-revalidate garante que, mesmo durante atualizações na origem, os usuários recebam instantaneamente a versão em cache enquanto a CDN atualiza os dados em segundo plano.

4. Proteção contra Picos de Tráfego e Ataques
A camada de borda da Cloudflare protege a aplicação contra indisponibilidade e exploração de custos:

Mitigação de DDoS: Proteção unificada em Camadas 3, 4 e 7 ativada por padrão via Cloudflare Unmetered Mitigation.
WAF (Web Application Firewall): Regras personalizadas bloqueando bots maliciosos, scrapers desprovidos de cabeçalhos válidos e padrões de varredura automatizada.
Rate Limiting na Borda: Limitação de requisições por IP em rotas dinâmicas ou de assets pesados para conter tentativas de estouro de banda.
Isolamento de Custos de Edge Functions: Rotas que exigem Edge Rendering são limitadas e possuem fallback estático estrito, eliminando o risco de cobranças por execuções em massa.

5. Performance Mobile e Dark Social
Grande parte do tráfego do projeto é originada em aplicativos de mensagens (WhatsApp, Telegram) e redes sociais (X/Twitter, Instagram, Facebook).
5.1 Otimização para Dark Social (OpenGraph)
Tags Meta Estritas: Implementação de og:image, og:image:width (1200), og:image:height (630), twitter:card (summary_large_image).
Pré-geração de Cards: Imagens OG personalizadas por deputado e por votação criadas durante o processo de build ou armazenadas na CDN na primeira requisição e mantidas de forma permanente.
Dimensões Leves: Compressão JPEG/WebP com meta tags otimizadas para carregamento imediato nos previews de conversas do WhatsApp.
5.2 Métricas de Performance Focal
Time to First Byte (TTFB): < 200ms globalmente (garantido pela entrega via Edge CDN estática).
First Contentful Paint (FCP): < 0.8s em conexões 4G móveis.
Otimização de Fotos de Deputados:
Sincronização offline e otimização das fotos oficiais da Câmara.
Conversão para formato WebP com dimensão fixa (ex: 150x150px) e qualidade 80%.
Uso do atributo fetchpriority="high" nas imagens above-the-fold e pré-carregamento de imagens via <link rel="preload"> para os perfis mais acessados.

6. Script e Pipeline de Ingestão de Dados
A atualização dos dados ocorre de forma assíncrona sem requisições diretas do cliente para as APIs governamentais (evitando instabilidades da API da Câmara dos Deputados).

[ API Câmara dos Deputados ]

              │

              ▼ (Cron Semanal / Dispatch)

    [ GitHub Actions Workflow ]

              │

              ├─► Ingestão de Dados (Python/Node.js)

              ├─► Otimização de Imagens (Sharp)

              ├─► Validação de Schemas JSON

              └─► Trigger Deploy (Cloudflare/Vercel)
6.1 Workflow do GitHub Actions (.github/workflows/data-sync.yml)
name: Sincronização Semanal de Dados

on:

  schedule:

    # Executa todo domingo às 03:00 UTC

    - cron: '0 3 * * 0'

  workflow_dispatch:

jobs:

  build-and-sync:

    runs-on: ubuntu-latest

    steps:

      - name: Checkout do Repositório

        uses: actions/checkout@v4

      - name: Configurar Node.js

        uses: actions/setup-node@v4

        with:

          node-version: '20'

          cache: 'npm'

      - name: Instalar Dependências

        run: npm ci

      - name: Executar Ingestão de Dados

        run: npm run data:ingest

      - name: Otimizar Imagens de Deputados

        run: npm run data:process-images

      - name: Validar Integridade dos Dados

        run: npm run data:validate

      - name: Commit e Push das Alterações (se houver mudanças)

        uses: stefanzweifel/git-auto-commit-action@v5

        with:

          commit_message: "chore(data): atualização automática de votações [skip ci]"

          file_pattern: "public/data/*"

      - name: Trigger Build & Deploy

        run: npm run deploy:trigger
6.2 Garantia de Operação Client-Side
Sem chamadas de rede externas no cliente: O aplicativo do usuário nunca faz requisições diretas para dadosabertos.camara.leg.br.
Resiliência a falhas de API: Se a API da Câmara estiver fora do ar durante a execução do cron, o pipeline falha graciosamente mantendo os dados da semana anterior intactos na CDN.
Consumo Eficiente de Dados: Redução de até 95% do volume de dados trafegado no celular do usuário final devido à consolidação e minificação prévia dos arquivos JSON.
