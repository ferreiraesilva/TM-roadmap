# Especificação — classificação e busca de mídias por conteúdo e uso

## Problema

O classificador atual responde principalmente **o que aparece** na imagem ou no
vídeo. A categoria única (`imagem_render`, `campanha`, `video` etc.) tenta também
representar **que tipo de peça é**, criando categorias artificialmente
excludentes. Uma peça publicitária pode mostrar uma cozinha; um vídeo de drone
publicado em rede social pode depois ser útil para explicar a vista a um cliente.

A busca atual filtra por empreendimento, categoria, tags e descrição. Ela não sabe
distinguir entre conteúdo limpo, peça pronta para publicação e ativo adequado para
determinado destino. Como consequência, um pedido por "foto da cozinha" pode
entregar um flyer, e um pedido por "algo para postar" pode entregar apenas uma
perspectiva sem identidade, texto ou formato editorial.

## Decisão de produto

Classificar cada ativo em eixos independentes:

1. **Conteúdo:** o que aparece — ambiente, elementos, tipologia, vista, assunto.
2. **Natureza editorial:** como o arquivo foi produzido — conteúdo limpo, peça
   publicitária ou híbrido.
3. **Adequação de uso:** para que o ativo pode servir — enviar ao cliente, publicar
   em rede social, apresentação do corretor ou uso institucional. É multi-label.
4. **Prontidão:** se já está pronto para publicação ou exige edição/composição.
5. **Formato/canal:** feed, story, reel, vídeo horizontal, WhatsApp, apresentação.

Nenhum desses eixos substitui `categoria`, `tags`, ambientes ou descrição. Eles
complementam a classificação existente.

## Exemplos

| Ativo | Conteúdo | Natureza editorial | Adequado para | Pronto para publicar |
|---|---|---|---|---:|
| Render limpo de cozinha | cozinha, bancada | conteúdo limpo | cliente, rede social | não |
| Card vertical com render, copy e logos | cozinha, salão de jogos | peça publicitária | cliente, rede social | sim |
| Drone mostrando vista dos andares | vista, entorno, fachada | conteúdo limpo ou híbrido | cliente, rede social | depende da edição |
| Reel com lettering e trilha | vista, entorno | peça publicitária | cliente, rede social | sim |
| Planta com legenda técnica | planta, tipologia | conteúdo técnico | cliente, apresentação | não aplicável |

## Objetivos

- Entregar mídia coerente com o destino explicitado pelo corretor em pelo menos
  95% dos casos do benchmark.
- Manter a recuperação por ambiente/tema atual, sem regressão superior a 2 pontos.
- Distinguir conteúdo limpo de peça publicitária com pelo menos 90% de acerto.
- Identificar peças prontas para feed/story/reel com pelo menos 90% de precisão.
- Não impedir reutilização: um ativo pode ser adequado para cliente e rede social.
- Permitir backfill e evolução da taxonomia sem reingerir os arquivos originais.

## Não objetivos da primeira versão

- Criar automaticamente cards, reels ou copies.
- Publicar diretamente em redes sociais.
- Medir performance da campanha ou engajamento.
- Substituir aprovação jurídica ou de marca.
- Inferir direitos de uso de imagem; isso exige metadado próprio futuro.

## Histórias de usuário

- Como corretor, quero pedir uma foto limpa da cozinha para mostrar ao cliente sem
  receber uma arte cheia de texto.
- Como corretor, quero pedir uma peça pronta para story para publicar sem editar.
- Como corretor, quero enviar ao cliente um vídeo de drone que também foi usado em
  rede social, pois a origem do vídeo não limita seu uso atual.
- Como corretor, quero pedir apenas "material da cozinha" e receber uma pergunta
  curta quando não estiver claro se preciso de conteúdo limpo ou peça pronta.
- Como gerente, quero que materiais inadequados ou ambíguos sejam revisáveis sem
  apagar a classificação de conteúdo correta.

## Modelo de classificação v2

Resposta estruturada para imagem e vídeo:

```json
{
  "conteudo": {
    "classe": "perspectiva",
    "ambientes": ["cozinha", "rota pub"],
    "elementos": ["mesa de bilhar", "mesa de jantar"],
    "tags": ["área comum", "iluminação moderna"],
    "descricao": "Ambiente comum do Rota Pub com cozinha integrada e mesa de bilhar."
  },
  "editorial": {
    "natureza": "peca_publicitaria",
    "adequado_para": ["enviar_cliente", "publicar_rede_social"],
    "pronto_para_publicar": true,
    "formatos": ["feed_vertical", "story"],
    "sinais": {
      "texto_sobreposto": true,
      "copy_promocional": true,
      "logos": true,
      "cta": false,
      "rodape_legal": true,
      "identidade_visual": true
    }
  },
  "confianca": {
    "conteudo": 0.94,
    "editorial": 0.97,
    "adequacao": 0.82
  }
}
```

Valores iniciais:

### `natureza`

- `conteudo_limpo`: foto, render ou vídeo sem composição editorial relevante;
- `peca_publicitaria`: layout/copy/branding produzido para divulgação;
- `hibrido`: conteúdo visual editado, mas ainda reutilizável como demonstração;
- `conteudo_tecnico`: planta, tabela, esquema ou memorial visual;
- `indeterminado`.

### `adequado_para`

- `enviar_cliente`;
- `publicar_rede_social`;
- `apresentacao_corretor`;
- `institucional`;
- `uso_interno`.

### `formatos`

- `feed_quadrado`, `feed_vertical`, `story`, `reel`;
- `video_vertical`, `video_horizontal`, `drone`, `tour`;
- `whatsapp`, `apresentacao`;
- `sem_formato_editorial`.

Formato não deve ser inferido somente pela proporção. Proporção vertical é um
sinal; texto, branding, duração e composição completam a decisão.

## Persistência

Adicionar campos à tabela `arquivos` sem remover os atuais:

```sql
natureza_editorial        text
adequado_para             text[] NOT NULL DEFAULT '{}'
pronto_para_publicar      boolean
formatos_midia            text[] NOT NULL DEFAULT '{}'
sinais_editoriais         jsonb NOT NULL DEFAULT '{}'
classificacao_midia_versao text
confianca_editorial       numeric
```

Usar `text` + validação na aplicação inicialmente, em vez de enum PostgreSQL,
porque a taxonomia ainda será calibrada. `categoria`, `descricao` e `tags`
continuam como fonte do eixo de conteúdo.

Índices após validar cardinalidade:

- GIN em `adequado_para`;
- GIN em `formatos_midia`;
- índice parcial para `pronto_para_publicar = true`.

## Classificador

### Imagem

1. Manter downscale atual.
2. Trocar `_PROMPT_IMG` por prompt versionado v2 com os dois eixos.
3. Exigir JSON Schema/structured output quando suportado.
4. Normalizar enums, listas e confiança antes de persistir.
5. Enviar para revisão se JSON for inválido ou confiança editorial < 0,70.

### Vídeo

Adicionar ao prompt atual:

- texto/lettering detectado;
- presença de logo, CTA, trilha e rodapé;
- edição vertical/horizontal;
- natureza editorial;
- adequação de uso e prontidão;
- conteúdo visual existente: ambientes, vista, drone, tour, obra, evento.

Não classificar `drone` como sinônimo de rede social. Drone descreve o conteúdo ou
a técnica; o destino é outro eixo.

### Heurística

Pastas como `campanha`, `social`, `story`, `feed`, `reels`, `peças` e `criativos`
podem sugerir natureza/finalidade, mas nunca substituir a análise visual. A pasta
gera um prior; o modelo confirma.

## Contrato de busca

Evoluir `minhaincorp_midia` com campos opcionais:

```json
{
  "empreendimento": "Rota Panorama",
  "tipo": "imagem",
  "tema": "cozinha",
  "destino": "cliente|rede_social|apresentacao|qualquer",
  "preparo": "limpo|pronto_para_publicar|qualquer",
  "formato": "feed|story|reel|horizontal|vertical|qualquer"
}
```

`destino` representa o uso pretendido agora, não a origem do arquivo. Um vídeo que
foi publicado em rede social pode ser buscado com `destino=cliente` se também
estiver marcado como adequado para cliente.

## Interpretação do pedido

| Pedido | Parâmetros |
|---|---|
| “Foto da cozinha para mandar ao cliente” | `destino=cliente`, `preparo=limpo` |
| “Algo da cozinha para postar” | `destino=rede_social`, `preparo=pronto_para_publicar` |
| “Story pronto do empreendimento” | `destino=rede_social`, `preparo=pronto_para_publicar`, `formato=story` |
| “Vídeo de drone para mostrar a vista ao cliente” | `tipo=video`, `tema=vista drone`, `destino=cliente` |
| “Vídeo de drone para postar” | `tipo=video`, `tema=drone`, `destino=rede_social` |
| “Material da cozinha” | perguntar cliente × rede social se ambas mudarem o resultado |

Regras conversacionais:

1. Menção a cliente, comprador, apresentação ou "mostrar" define cliente.
2. Menção a postar, divulgar, Instagram, feed, story ou reel define rede social.
3. Pedido explícito por foto/vídeo sem destino prioriza cliente e conteúdo limpo,
   pois é o comportamento histórico esperado.
4. Pedido genérico por "material" pergunta o destino quando houver acervos
   distintos.
5. A pergunta deve ser curta: “Você quer imagens para enviar ao cliente ou peças
   prontas para postar?”

## Busca e ranking

Filtros rígidos continuam:

- tenant;
- empreendimento;
- modalidade/extensão real;
- classificado e aprovado;
- tipo explícito incompatível.

Uso, prontidão e formato entram prioritariamente como ranking, não como exclusão,
para permitir reutilização e fallback.

Pontuação inicial sugerida:

| Sinal | Pontos |
|---|---:|
| Tema/ambiente | 35 |
| Destino em `adequado_para` | 25 |
| Prontidão solicitada | 20 |
| Formato solicitado | 10 |
| Confiança/classificação aprovada | 10 |

Quando nenhum ativo cumprir exatamente o pedido:

1. relaxar formato;
2. relaxar prontidão;
3. manter tema e destino;
4. informar sucintamente que o material disponível exige adaptação;
5. nunca trocar silenciosamente cozinha por outro ambiente ou vídeo por imagem.

## Compatibilidade

- Chamadas antigas sem os novos parâmetros mantêm o comportamento atual.
- Linhas antigas com novos campos nulos continuam pesquisáveis.
- Durante o backfill, o ranking considera metadados novos quando presentes e usa
  categoria/tags/descrição como fallback.
- A resposta e as diretivas `MEDIA_CAPTION` não mudam nesta entrega.

## Migração e backfill

1. Criar migration aditiva.
2. Implementar parser/normalizador v2 e dual-write.
3. Classificar novos arquivos com v2.
4. Executar backfill por tenant em lotes retomáveis, começando pelos ambientes já validados.
5. Não alterar `categoria`, `descricao` ou tags existentes durante o primeiro
   backfill; preencher apenas os novos eixos.
6. Separar amostra de baixa confiança para revisão humana.
7. Comparar distribuição antes/depois e ajustar taxonomia.
8. Repetir o benchmark em amostras de novos clientes para detectar variação de domínio, sem bloquear o default.

## Benchmark

Criar dataset City com pelo menos:

- 10 fotos/renders limpos;
- 10 cards/flyers de feed/story;
- 5 vídeos limpos ou tours;
- 5 reels/vídeos promocionais;
- 5 drones reutilizáveis para cliente e rede social;
- plantas e documentos como negativos.

Medir separadamente:

- conteúdo/ambiente;
- natureza editorial;
- adequação multi-label;
- prontidão;
- formato;
- resultado final da busca para 20–30 pedidos em linguagem natural.

Hard gates:

- não perder o ambiente correto;
- não tratar finalidade como categoria exclusiva;
- não entregar documento/planta quando pedido for foto/vídeo;
- preservar diretivas de entrega;
- nenhum vazamento entre tenants.

## Métricas de sucesso

### Classificação

- ≥ 90% de acerto em natureza editorial;
- ≥ 90% de precisão para `pronto_para_publicar`;
- F1 ≥ 0,85 em `adequado_para`;
- regressão de conteúdo/ambiente ≤ 2 pontos;
- JSON válido em 100% dos casos elegíveis.

### Busca

- ≥ 95% de Hit@3 para destino correto;
- ≥ 90% de Hit@1 em pedidos explícitos por cliente ou rede social;
- ≤ 5% de necessidade de esclarecimento em pedidos explícitos;
- 100% de esclarecimento nos casos realmente ambíguos definidos no gabarito;
- custo e latência sem regressão superior a 20%, salvo ganho de qualidade material.

## Fases

### Fase 0 — dataset e baseline

- Selecionar e rotular a amostra City.
- Versionar somente IDs sanitizados e métricas.
- Medir classificador e busca atuais.

### Fase 1 — classificação v2

- Migration aditiva.
- Prompt e normalizador v2 para imagem/vídeo.
- Persistência dos novos eixos.
- Testes unitários e benchmark offline.

### Fase 2 — busca e intenção

- Evoluir schema da ferramenta.
- Implementar ranking e fallback.
- Atualizar persona/instruções de uso.
- Testes de integração com entrega Telegram/WhatsApp.

### Fase 3 — backfill e rollout por tenant

- Backfill retomável.
- Revisão manual da baixa confiança.
- Smoke end-to-end com pedidos reais controlados.
- Métricas por uma semana.

### Fase 4 — generalização

- Repetir dataset/benchmark por cliente quando houver amostra representativa ou regressão observada.
- Ajustar apenas diferenças comprovadas por tenant.
- Promover ao MinhaIncorporadora como padrão com override configurável.

## Critérios de aceite P0

- [ ] Flyer com ambiente mantém o ambiente e recebe `peca_publicitaria`.
- [ ] O mesmo ativo pode ter cliente e rede social em `adequado_para`.
- [ ] Drone não implica automaticamente rede social.
- [ ] Pedido para cliente prioriza conteúdo limpo, mas aceita híbrido adequado.
- [ ] Pedido para postar prioriza peça pronta e formato solicitado.
- [ ] Pedido ambíguo gera esclarecimento quando necessário.
- [ ] Chamadas antigas continuam funcionando.
- [ ] Backfill não altera classificação de conteúdo existente.
- [ ] Banco e resultados permanecem isolados por tenant.

## Questões não bloqueantes

- Devemos mostrar uma prévia/seleção quando houver mais de uma peça igualmente
  adequada, em vez de enviar todas?
- Direitos de imagem e validade de campanha entrarão como metadados separados?
- Formato deve usar proporções exatas além dos nomes feed/story/reel?
- Uma peça expirada deve ser excluída ou apenas rebaixada no ranking?
