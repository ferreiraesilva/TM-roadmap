# SPIKE-0002 — modelo de classificação de vídeo

## Objetivo

Escolher um modelo OpenRouter com entrada nativa de vídeo para descrever e
classificar materiais imobiliários da EBM, priorizando qualidade suficiente,
custo por vídeo e estabilidade operacional.

## Restrições técnicas

- O OpenRouter recebe vídeos em `chat/completions` com conteúdo `video_url`.
- Só entram modelos cujo catálogo declara `video` em `input_modalities`.
- Para funcionar de forma igual entre provedores, o benchmark usa MP4 base64;
  URLs diretas têm restrições específicas, como Gemini AI Studio aceitar apenas
  links do YouTube.
- Cada original é convertido para H.264 480p/4 fps, no máximo 30 segundos. Vídeos
  longos são lidos por streaming e acelerados para representar o conteúdo inteiro,
  sem áudio; o original não é carregado integralmente em memória.
- O benchmark não altera `status_ingestao`, descrição ou tags no banco.

Fonte: [OpenRouter — Video Inputs](https://openrouter.ai/docs/guides/overview/multimodal/videos).

## Triagem de mercado

Preços abaixo são consultados novamente pelo script no endpoint de modelos; os
valores são USD por milhão de tokens de entrada/saída em 2026-06-27.

| Candidato | Entrada/saída | Evidência usada na triagem |
|---|---:|---|
| `bytedance-seed/seed-2.0-lite` | 0,25 / 2,00 | VideoMME 87,7; VideoMMMU 84,1; MotionBench 70,9 |
| `bytedance-seed/seed-2.0-mini` | 0,10 / 0,40 | VideoMME 81,2; VideoMMMU 80,6; MotionBench 64,4 |
| `qwen/qwen3.6-35b-a3b` | 0,14 / 1,00 | VideoMME sem legenda 82,5; VideoMMMU 83,7; MLVU 86,2 |
| `google/gemini-3.5-flash` | 1,50 / 9,00 | teto de qualidade/geração atual da linha Flash; validado no teste EBM |
| `google/gemini-2.5-flash-lite` | 0,10 / 0,40 | modelo estável recomendado pelo Google para classificação em alto volume |

Fontes primárias:

- [ByteDance Seed 2.0 — model card e benchmarks de vídeo](https://seed.bytedance.com/en/seed2)
- [Qwen3.6-35B-A3B — model card](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Google Gemini 2.5 Flash-Lite — model card](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-lite)
- [OpenRouter — Models API](https://openrouter.ai/docs/api/api-reference/models/get-models)

Os números são publicados pelos próprios fornecedores e servem apenas para
triagem. A decisão final usa os mesmos 10 vídeos EBM para todos os modelos.

## Benchmark EBM

Dataset versionado: `benchmarks/video_ebm_v1.json`.

O conjunto cobre vídeo de produto, tour aéreo, obra 3D, abertura de vendas,
evento esportivo e peças de campanha. No benchmark, nome do arquivo e
empreendimento não são enviados ao modelo, para evitar que a classe seja
deduzida da pasta em vez do conteúdo visual.

Cada resposta recebe até 100 pontos:

- JSON válido: 20
- tipo correto: 30
- descrição útil: 15
- tags: 10
- destaques concretos: 10
- ambientes: 5
- palavras esperadas: 10

O modelo recomendado é o mais barato entre os que:

1. concluírem os 10 casos sem erro; e
2. ficarem a até 5 pontos da maior nota média.

## Execução

Dentro do plugin implantado, com banco e chave OpenRouter configurados:

```bash
python scripts/benchmark_modelos_video.py --prepare-only
python scripts/benchmark_modelos_video.py
```

O resultado incremental fica, por padrão, em
`/tmp/minhaincorp-video-benchmark.json`. A execução pode ser retomada sem repetir
chamadas concluídas.

## Resultado

Executado em 2026-06-27 com os dez vídeos normalizados. Resultado sanitizado em
`benchmarks/video_ebm_v1_resultado.json`.

| Modelo | Nota | Sucessos | Custo 10 vídeos | Latência média |
|---|---:|---:|---:|---:|
| Gemini 2.5 Flash-Lite | **87,67** | **10/10** | **US$ 0,007558** | **4,75 s** |
| Seed 2.0 Lite | 85,33 | 10/10 | US$ 0,032038 | 20,47 s |
| Seed 2.0 Mini | 82,00 | 10/10 | US$ 0,008019 | 11,15 s |
| Qwen3.6-35B-A3B | 96,67* | 1/10 | US$ 0,005527 | 8,05 s |
| Gemini 3.5 Flash | 0,00 | 0/10 | US$ 0,058828 | 5,17 s |

\* Nota calculada sobre o único caso válido; modelo inelegível por falhar em 9/10.

O Gemini 2.5 Flash-Lite venceu porque foi o modelo completo mais bem pontuado,
teve o menor custo entre os finalistas e a menor latência. Na revisão qualitativa,
o Seed 2.0 Lite foi melhor em alguns tours/eventos, mas classificou vídeos de
produto como campanha e custou mais de quatro vezes o Gemini.

Decisão: `MINHAINCORP_MODELO_VIDEO=google/gemini-2.5-flash-lite`.
