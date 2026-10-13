# Documentação — Fiscal da Pátria

Índice dos documentos do projeto.

| Arquivo | Conteúdo |
|---|---|
| [`00_planejamento_por_etapas.md`](./00_planejamento_por_etapas.md) | **Registro vivo:** etapas concluídas, decisões e próximos passos (+ apêndice técnico) |
| [`01_prd_visao_geral.md`](./01_prd_visao_geral.md) | PRD — visão geral do produto, princípios e as 7 pautas |
| [`02_arquitetura_e_infra.md`](./02_arquitetura_e_infra.md) | Arquitetura, deploy de custo zero, caching e pipeline de dados |
| [`03_roadmap_e_codigo_base.md`](./03_roadmap_e_codigo_base.md) | Roadmap e código-base de referência |
| [`04_sobre_nos_manifesto.md`](./04_sobre_nos_manifesto.md) | Manifesto cívico ("Sobre Nós") |
| [`_originais/`](./_originais/) | Documentos `.docx` originais (preservados) |

> Os arquivos `01`–`04` foram **convertidos de `.docx` para Markdown** (texto extraído automaticamente); os binários originais estão preservados em `_originais/`. Imagens/diagramas dos originais não são reproduzidos.

## Mapa rápido do projeto

| Onde | O quê |
|---|---|
| `docs/00_planejamento_por_etapas.md` | Plano e registro por etapas (comece por aqui) |
| `public/data/parlamentares.json` | Dados consolidados (7 pautas × deputados) |
| `public/fotos/` | Fotos oficiais dos deputados (locais) |
| `scripts/fetch_votes.ts` / `scripts/fetch_fotos.ts` | Ingestão de dados e fotos |
| `tests/` | Suíte E2E (Playwright + axe) — `npm run test:e2e` |
| `../README.md` | Instruções de uso, scripts e princípios |
