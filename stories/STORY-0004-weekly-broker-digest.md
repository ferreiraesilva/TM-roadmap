# User Story: Digest semanal de novidades por empreendimento aos corretores

## Status

Draft

## Product

MinhaIncorporadora

## Related Epic

(Não associado - Core capabilities / cron jobs)

## Story

As a broker of a partner agency,
I want to receive an automatic weekly digest summarizing new assets, promotions, and changes to the developments,
so that I can keep myself updated without having to actively query the bot.

## Context

Weekly digests keep brokers engaged with the developer's content. A dedicated cron job `minhaincorp-digest-corretor` will scan for updates (new floor plans, videos, revised pricing) and dispatch a push notification summary to all active registered brokers of the tenant.

## Functional Requirements

- Command/cron line: `minhaincorp-digest-corretor`
- Scans for developments' updates within the last 7 days.
- Format is a clean, bulleted list grouped by development.
- Respects the broker-to-manager allocation (only active registered brokers).

## Acceptance Criteria

- [ ] Given a registered broker, when the weekly digest cron runs, then they receive a push message summary of developments' updates from the last week.
- [ ] Given no updates in the last 7 days, when the digest cron runs, then no message is sent.

## Out of Scope

- Daily or monthly variations (controlled strictly as weekly).
- Custom templates per broker.
