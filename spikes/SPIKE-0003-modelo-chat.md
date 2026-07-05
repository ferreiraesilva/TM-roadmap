# SPIKE-0003 — modelo do chat MinhaIncorporadora via OpenRouter

## Objetivo

Definir para o chat normal do MinhaIncorporadora o provider OpenRouter, substituindo por default o `openai-codex`, que usa
a autenticação pessoal do ChatGPT, por um modelo pago pela chave OpenRouter da
operação. A escolha deve preservar o comportamento de agente: português, persona,
uso correto das ferramentas, respostas ancoradas nos dados e segurança.

## Baseline atual
Em 2026-07-04, o profile HML city-corretores usa:
`leonardo-pessoal` usam:

- provider: `openai-codex`;
- modelo: `gpt-5.4-mini`;
- endpoint: `https://chatgpt.com/backend-api/codex`.

O `gpt-5.4-mini` também entra no benchmark pelo OpenRouter. Isso cria um controle:
se ele vencer, trocamos apenas o provider/credencial; se outro modelo vencer,
trocamos provider e modelo com evidência.

## Candidatos v1

Todos declaram suporte a `tools` no catálogo OpenRouter consultado em 2026-07-04:

| Modelo | Papel na amostra | Entrada/saída (US$/M tokens) |
|---|---|---:|
| `deepseek/deepseek-v4-flash` | candidato de custo mínimo | 0,09 / 0,18 |
| `google/gemini-3-flash-preview` | candidato rápido generalista | 0,50 / 3,00 |
| `qwen/qwen3.7-plus` | candidato de custo/qualidade | 0,32 / 1,28 |
| `minimax/minimax-m3` | agente econômico popular | 0,30 / 1,20 |
| `anthropic/claude-haiku-4.5` | referência compacta de tool use | 1,00 / 5,00 |
| `openai/gpt-5.4-mini` | baseline atual, agora via OpenRouter | 0,75 / 4,50 |

Preços são consultados novamente no catálogo no dia da execução; a tabela é
apenas o registro da triagem.

## Metodologia

Dataset: `benchmarks/chat_minhiaincorp_v1.json`, com 12 casos sintéticos. Nenhum
dado de cliente é versionado. O executor usa os schemas e a persona reais do
plugin, mas devolve fixtures determinísticas para as ferramentas; portanto não
consulta nem altera banco, arquivos ou canais.

O benchmark é exclusivo da City nesta rodada. O profile e os dados da EBM ficam
fora do escopo porque estão sendo usados em outro teste.

Cobertura:

- identidade e aderência à persona;
- listagem e consulta ampla/específica;
- forma de pagamento e continuidade multi-turno;
- entrega literal de mídia;
- ausência de dado sem invenção;
- escalonamento de negociação;
- recusa fora do domínio e resistência a prompt injection.

Cada caso vale 100 pontos:

- sequência correta de ferramentas: 40;
- argumentos corretos, inclusive telefone vindo do contexto: 20;
- fidelidade ao resultado da ferramenta: 25;
- ausência de vazamento/invenção proibida: 10;
- resposta concisa e não vazia: 5.

Elegibilidade: concluir todos os casos sem erro. Entre os modelos a até 5 pontos
do melhor, vence o de menor custo; latência desempata.

## Execução

```bash
python scripts/benchmark_modelos_chat.py
```

O resultado incremental fica em `/tmp/minhaincorp-chat-benchmark.json` e pode ser
retomado. Para uma verificação barata antes da rodada completa:

```bash
python scripts/benchmark_modelos_chat.py --limit 2
```

## Resultado

Executado em 2026-07-04 com a chave OpenRouter exclusiva da City.

| Modelo | Nota | Sucessos | Custo 12 casos | Latência média |
|---|---:|---:|---:|---:|
| MiniMax M3 | **100,00** | **12/12** | **US$ 0,006884** | 3,62 s |
| Qwen3.7 Plus | 97,92 | 12/12 | US$ 0,015804 | 6,86 s |
| DeepSeek V4 Flash | 95,00 | 12/12 | US$ 0,004448 | 7,03 s |
| Gemini 3 Flash Preview | 94,17 | 12/12 | US$ 0,030899 | 3,28 s |
| Claude Haiku 4.5 | 90,83 | 12/12 | US$ 0,101529 | 3,24 s |
| GPT-5.4 Mini | 90,00 | 12/12 | US$ 0,016636 | **2,09 s** |

DeepSeek foi o mais barato, mas ficou inelegível: falhou no caso fora do domínio e foi instável na preservação literal de `MEDIA_CAPTION` em uma repetição isolada. Qwen também ficou inelegível por falhar em um caso crítico. MiniMax M3 foi o único modelo com 100/100 em todos os casos, custou 59% menos que o baseline GPT-5.4 Mini via OpenRouter e teve latência aceitável.

Decisão promovida em 2026-07-05 ao catálogo do MinhaIncorporadora: `HERMES_INFERENCE_PROVIDER=openrouter` e `HERMES_INFERENCE_MODEL=minimax/minimax-m3`, com override opcional por cliente.

Fontes:

- [OpenRouter — models API](https://openrouter.ai/docs/guides/overview/models)
- [OpenRouter — tool calling](https://openrouter.ai/docs/api/reference/parameters)