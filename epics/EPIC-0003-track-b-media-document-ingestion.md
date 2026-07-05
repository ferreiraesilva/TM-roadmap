# [EPIC] Track B — Ingestão e classificação de mídia e documentos (piloto EBM)

## Status

Draft (pronto pra detalhar; piloto na EBM)

## Product

MinhaIncorporadora

## Parent Initiative

— (núcleo do produto; habilita campanhas/eventos — EPIC-0001/0002 — e o atendimento
com material real)

## Problem

A incorporadora guarda o material num repositório próprio e bagunçado (a EBM usa o
"FileHub" em `arquivos.ebm.com.br`, navegado por `?path=`/`file_browser.php`). O bot
precisa **achar e entregar o arquivo certo** ("manda a foto da cozinha", "que vídeos
tem do Rota Panorama") sem reler tudo a cada pergunta e **sem inventar**. O conteúdo
não tem etiqueta: o significado está no **nome da pasta** e no **nome do arquivo**, e
no **conteúdo** (imagem/vídeo/PDF) — cabe à IA capturar isso.

## Objective

Pipeline que **adquire, classifica, estrutura e expõe** o conteúdo de cada
incorporadora como conhecimento buscável + arquivo entregável nativo, alinhado ao
contrato canônico (RFC-0005), reaproveitável por cliente via **adapter de fonte**.

## Scope

Três estágios (ver discussão de arquitetura): **1) Adquirir** (específico da fonte) →
**2) Enriquecer → Contrato** (IA, agnóstico) → **3) Carregar** (determinístico). O
contrato fica **materializado** entre 2 e 3 (revisável; classifica-se uma vez).

### Multidimensional media intent (MinhaIncorporadora default)

Media classification must represent independent axes: content, editorial nature, recommended uses, publication readiness and channel format. Retrieval accepts the broker's current destination and ranks matching assets first. Prior social publication does not prevent a drone or environment video from being sent to a customer. The implementation is the configurable MinhaIncorporadora default; deployment, backfill and validation remain isolated per tenant.

### Taxonomia de mídia (aterrada em Now 111 + Rota Panorama)
Pasta = categoria; nome do arquivo = sub-tag; conteúdo confirma/enriquece.

| Classe | Pastas reais | Sub-tag no arquivo |
|---|---|---|
| Produto | Fotos decorado, Perspectivas, Imagem aérea, Plantas, Book, Manual do corretor, Vídeos (teaser/produto/tour/VR) | `Cozinha`, `Perspectiva fachada/gourmet`, `Planta 2Q/studio` |
| Institucional/marca | Marca (logos), Apresentação Meeting | — |
| Campanha | Peças digitais (feed/story), "Assinou ganhou" | — |
| Evento | Convites abertura de vendas, Convite repique, Fotos abertura/meeting, Premiação | — |
| Comercial (ignorar p/ fato) | Tabela/TABELA (PDF datado) | preço vem da Track A |

## Out of Scope

- Extrair preço/disponibilidade de documento (vem da Track A / API — EPIC-0004).
- O modelo estruturado de campanha/evento em si (EPIC-0001/0002) — aqui entregamos o
  **material** dessas classes; a lógica temporal/QR é dos outros epics.

## User Flow

Corretor: "manda a foto da cozinha do Now 111" → bot acha o asset classificado
(categoria=foto-decorado, tag=cozinha) e **envia o arquivo nativo**. "Que vídeos tem
do Rota Panorama?" → "teaser, produto, localização, tour VR" → corretor escolhe →
bot entrega.

## Target Repository

`hermes-minhaincorporadora` (+ um serviço/worker de ingestão; ver SPIKE-0001).

## Dependencies

- RFC-0005 (design do backend de conteúdo).
- SPIKE-0001 (roteamento multi-modelo via OpenRouter — sem profiles por modalidade).
- EPIC-0004 (Track A) — o **id estável de empreendimento** é a chave em que a mídia
  ancora (resolve o problema de casar nome com acento/NFD).

## User Stories

- [ ] Como corretor, peço uma foto/planta/vídeo/PDF por assunto e recebo o **arquivo**
      (não link), nativo no WhatsApp.
- [ ] Como corretor, pergunto "que material tem do empreendimento X?" e recebo a lista
      por categoria.
- [ ] Como operador, sou avisado do que foi ingerido/classificado e dos erros (RCA).
- [ ] Como sistema, nunca entrego material de empreendimento errado (ancora no id).
- [ ] `STORY-0003`: As a broker, I can distinguish customer media from media ready for social publication without making those uses mutually exclusive.

## Technical Tasks

- [ ] **Adapter de fonte EBM/FileHub**: listar via `file_browser.php?path=`, baixar
      bytes (sem links). Genérico por cliente no futuro.
- [ ] **Aquisição + dedup por hash** + storage local (`files_dir` por instância; object
      store no futuro). Nunca rebaixar/reanalisar asset inalterado.
- [ ] **Sniff de tipo por conteúdo (magic bytes)** — há arquivos **sem extensão** (17
      perspectivas, imagem aérea e vídeos do Rota Panorama). Não confiar na extensão.
- [ ] **Pular parciais/temporários** (`.pptx.part` apareceu no Rota Panorama).
- [ ] **Classificação/enriquecimento multi-modelo** (imagem/vídeo/PDF → modelo via
      OpenRouter, SPIKE-0001): categoria + tags + **descrição rica** (indexada na FTS) +
      tipo de documento (planta/manual/memorial — todos entregáveis, nenhum vira fato).
- [ ] **Galerias de evento**: pastas com 180–320 fotos (Fotos abertura/meeting) →
      classificar no **nível da pasta + amostragem**, não asset a asset (custo).
- [ ] **Mapeamento pasta→categoria / nome→sub-tag**, com conflito (nome × conteúdo) →
      gate de revisão.
- [ ] **Contrato JSON de mídia** (asset → empreendimento_id, classe, categoria, tags,
      descrição, arquivo) — materializado e revisável.
- [ ] **Loader** (`import_json` → `midias` + campos): idempotente, estado completo.
- [ ] **Gate de revisão humana** (`lotes_importacao`) antes de publicar no banco vivo.
- [ ] **Console/monitor** (1 profile Hermes): relatório de ingestão + RCA de erro.
- [ ] **Additive media-intent schema**: editorial nature, recommended uses, publication readiness, formats, signals, confidence and classifier version.
- [ ] **Image/video classifier v2**: structured content + editorial output; folder names are priors, never the sole source of use.
- [ ] **Backward-compatible media tool contract**: optional destination, preparation and format in `minhaincorp_midia`.
- [ ] **Intent-aware ranking**: strict tenant/project/modality boundaries with weighted theme, destination, readiness and format.
- [ ] **Tenant-isolated resumable backfill**: fill new fields without rewriting category, tags or description; low confidence goes to review.
- [ ] **Classification and retrieval benchmark**: clean visuals, social creatives, reusable drone content and negative cases.
- [ ] **Cross-tenant validation**: repeat benchmarks on representative clients to detect domain regressions without blocking the configurable default.

## Acceptance Criteria

- [ ] Pedir material por assunto retorna o **arquivo nativo** correto, ancorado no
      empreendimento certo.
- [ ] Arquivos sem extensão e parciais são tratados corretamente (sniff/pular).
- [ ] Galerias grandes não estouram custo (classificação por pasta/amostra).
- [ ] Nada de fato comercial inferido de documento.
- [ ] Content and intended use are independently represented; one asset may support customer delivery and social publication.
- [ ] Explicit customer requests prioritize clean suitable media; explicit social requests prioritize ready assets and format.
- [ ] Materially ambiguous generic requests trigger one short clarification.
- [ ] Existing `minhaincorp_midia` calls and native delivery directives remain compatible.
- [ ] A tenant rollout and backfill make no change to any other tenant data, files, configuration or channels.
