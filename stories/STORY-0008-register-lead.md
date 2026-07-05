# User Story: Registrar lead comercial

## Status

Draft

## Product

MinhaIncorporadora

## Related Epic

(Não associado)

## Story

As a broker,
I want to register a prospective client's interest (lead) in a specific development,
so that the Sales Manager has visibility of potential buyers and can support negotiations.

## Context

Integrating lead registration early on helps developer sales teams track broker activity and follow up with correct resources.

## Functional Requirements

- Tool: `minhaincorp_registrar_lead(cliente_nome, cliente_contato, empreendimento, corretor_id)`
- Saves the entry in a new table `minhaincorp.leads`.

## Acceptance Criteria

- [ ] Given a broker, when they request lead registration with a name and phone/email, then the lead details are successfully logged and linked to the broker's portfolio.
