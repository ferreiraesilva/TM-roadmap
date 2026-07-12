# Decision: MinhaIncorporadora is the Sales Manager's Assistant

## Status

Accepted — 2026-06-25

## Context

MinhaIncorporadora shipped its v1 with a persona that was framed incorrectly.
First it was described as a *broker persona* ("persona de corretor"); a later fix
(commit `6282b37`) reframed it as a standalone *commercial attendant* ("Atendente
Comercial") and explicitly stated it was "not the manager's assistant".

Both framings are wrong. The assistant does not impersonate a broker, and it is not
a generic attendant disconnected from a real person. In the real relationship, a
**Sales Manager** (Gerente de Vendas) owns the commercial relationship with a set of
partner agencies and their brokers. The product exists to do, instantly and at
scale, what that Sales Manager used to do by hand.

## Decision

MinhaIncorporadora's assistant is the **Assistente do Gerente de Vendas** (the Sales
Manager's Assistant). The corrected domain model is:

```text
Incorporadora
└── Gerentes de Vendas (each handles X agencies)
    └── Assistente do Gerente de Vendas  ← the product
        └── Corretores (each linked to one agency)
```

- The broker (corretor) is **who the assistant serves**, not who it impersonates.
- An agency (imobiliária) exists **only** to link a broker to exactly one Sales
  Manager.
- Escalation hands off to the broker's **Sales Manager**.
- When the broker (and therefore his Sales Manager) is known, the assistant may name
  the Sales Manager it works for.

This decision supersedes the framing in commit `6282b37`.

## Consequences

- `hermes-minhaincorporadora` updates `SOUL.md`, `persona.py`, escalation copy, tool
  descriptions, services docstrings, README, AGENTS and PROGRESS to use "Assistente
  do Gerente de Vendas" and "Gerente de Vendas".
- The schema documents the corrected model and enforces that every agency has a
  Sales Manager (`imobiliarias.gerente_id NOT NULL`) via migration `0002`, applied
  safely and idempotently.
- The physical table `gerentes` is retained (additive, not destructive) and is
  documented as representing the Sales Manager. A rename to `gerentes_vendas` is a
  deferred, optional future task.
- The product catalog description is corrected so MinhaIncorporadora is no longer
  called a "broker assistant".

## Related Repositories

- `TM-roadmap` — `rfcs/RFC-0003-minhaincorporadora-persona-model-correction.md`.
- `hermes-minhaincorporadora` — persona, escalation, schema and docs changes.
- `hermes-infra` — owns concrete EBM/City deployments; corrected vocabulary should
  be used in any future client-facing description.
