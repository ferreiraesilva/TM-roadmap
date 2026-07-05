# Spike: Avaliação de RAG para dados não estruturados de incorporadoras

## Status

Draft

## Product

MinhaIncorporadora

## Related Epic or Initiative

(Não associado)

## Question

Como e quando devemos introduzir recuperação de informações não estruturadas (RAG) no MinhaIncorporadora, garantindo consistência e zero alucinação?

## Context

Atualmente, todos os fatos são estruturados (tabelas e mídias diretas). RAG introduz custos e riscos adicionais de alucinação de dados críticos (preço, disponibilidade). Devemos planejar essa capacidade somente se houver demandas de materiais textuais densos (por exemplo, regulamentos técnicos ou descrições longas de construção).

## Research Scope

- Identificar se os PDFs de memórias descritivas exigem busca em linguagem natural.
- Definir limites e proteções para que o RAG nunca responda sobre preços ou condições de pagamento (onde a ferramenta determinística deve prevalecer).

## Out of Scope

- Implementação de banco vetorial ou pipelines de chunking/embedding adicionais (estudado em SPIKE-0004).

## Expected Output

- Recomendação técnica de adoção de RAG híbrido ou descarte em favor de dados estruturados.
