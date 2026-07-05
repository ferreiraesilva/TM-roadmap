# SPIKE-0004 — embedding e recuperação do MinhaIncorporadora

## Decisão final

Usar como default configurável do MinhaIncorporadora:

- modelo: `baai/bge-m3`;
- dimensões: 1.024;
- chunking: janela atual de 500 palavras com overlap de 50;
- texto indexado: empreendimento + documento + conteúdo;
- recuperação: busca híbrida por Reciprocal Rank Fusion (FTS + vetor);
- top-k mínimo: 5.

Decisão promovida ao default global em 2026-07-05 após a validação na EBM; cada container pode sobrescrever por ambiente.

## Corpus e método

O benchmark de 2026-07-04 usou somente o banco real da City: 6 documentos, 45 chunks atuais, quatro empreendimentos e 20 perguntas comerciais. Candidatos ficaram em memória, sem escrita no banco. Conteúdo e perguntas reais não são versionados.

Qualidade ponderada: Hit@1 (40%), Hit@3 (25%), MRR (20%) e nDCG@5 (15%). O texto indexado inclui metadados:

```text
Empreendimento: <nome>
Documento: <título>

<conteúdo do chunk>
```

## Rodada 1 — modelos

O modelo vigente `openai/text-embedding-3-small` obteve apenas 35% de Hit@3. Gemini liderou a busca densa, mas em 1.536 dimensões custou US$ 0,005854.

## Rodada 2 — chunking × modelo

Foram comparadas as estratégias 500/50 atual, 220/40, 120/20 e semântica 220/35. Reduzir os chunks não melhorou a recuperação.

| Chunking + modelo | Qualidade | Hit@1 | Hit@3 | Custo |
|---|---:|---:|---:|---:|
| 500/50 + Gemini 1536d | **78,98** | **75%** | **90%** | US$ 0,005952 |
| 500/50 + Qwen3 8B | 74,98 | 70% | 85% | US$ 0,000482 |
| 120/20 + Gemini 1536d | 70,96 | 60% | 90% | US$ 0,006969 |
| 120/20 + Qwen3 8B | 70,05 | 60% | 85% | US$ 0,000567 |

Gemini ganhou quatro pontos sobre Qwen, mas custou 12,4 vezes mais.

## Rodada 3 — busca híbrida final

Com chunking 500/50, combinamos ranking vetorial e textual por RRF:

| Modelo | Qualidade | Hit@1 | Hit@3 | Custo | Relativo |
|---|---:|---:|---:|---:|---:|
| `baai/bge-m3` | **79,94** | **75%** | 90% | **US$ 0,000398** | **1,0×** |
| `google/gemini-embedding-001` | 77,21 | 70% | 90% | US$ 0,005962 | 15,0× |
| `qwen/qwen3-embedding-8b` | 76,49 | 65% | **95%** | US$ 0,000482 | 1,2× |

BGE-M3 venceu simultaneamente em qualidade e custo. Qwen teve o maior Hit@3, mas perdeu em Hit@1, MRR e nDCG; Gemini foi pior e quinze vezes mais caro.

## Consequências

1. Migrar `vector(1536)` para `vector(1024)` ou criar armazenamento versionado novo.
2. Reindexar cada tenant em lotes retomáveis após aplicar a migração aditiva.
3. Prefixar empreendimento e documento antes do embedding.
4. Implementar FTS + vetor com RRF e top-k mínimo 5.
5. Registrar `embedding_model`, `embedding_dim` e `chunk_version`.
6. Manter os vetores antigos até validar o backfill do tenant e preservar rollback.

## Artefatos

- `scripts/benchmark_modelos_embedding.py`
- `scripts/benchmark_chunking_embedding.py`
- `benchmarks/embedding_city_v1_resultado.json`
- `benchmarks/chunking_embedding_city_v2_resultado.json`
- `benchmarks/embedding_hybrid_city_v2_resultado.json`

Fontes:

- [OpenRouter — Embeddings API](https://openrouter.ai/docs/api/reference/embeddings)
- [OpenRouter — modelos de embedding](https://openrouter.ai/docs/api/api-reference/embeddings/list-embeddings-models)