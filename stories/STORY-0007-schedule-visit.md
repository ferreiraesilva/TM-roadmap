# User Story: Agendar visita aos empreendimentos

## Status

Draft

## Product

MinhaIncorporadora

## Related Epic

(Não associado)

## Story

As a broker,
I want to request a visit schedule for a customer at a development through the assistant,
so that the appointment is registered and coordinated with the Sales Manager.

## Context

Allowing brokers to schedule client visits to model apartments or construction sites directly via chat reduces friction and speeds up the sales cycle.

## Functional Requirements

- Tool: `minhaincorp_agendar_visita(empreendimento, data_hora, corretor_id, cliente_nome)`
- Saves visit request in a new table `minhaincorp.visitas`.
- Triggers notification to the mapped Sales Manager.

## Acceptance Criteria

- [ ] Given a broker, when they request to schedule a visit (providing date/time and development), then the visit is saved in the database with status 'pending' and the manager is notified.
