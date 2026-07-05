# User Story: Request media for a customer or social publication

## Status

Draft

## Product

MinhaIncorporadora

## Related Epic

`epics/EPIC-0003-track-b-media-document-ingestion.md`

## Story

As a broker, I want to state whether I need media to show a customer or to publish
on social media, so that I receive an asset appropriate for the current use without
losing relevant content.

## Context

The same asset may serve multiple purposes. A clean drone video can be posted or
sent to a customer; an advertising card may show the requested kitchen and be ready
for a story. The assistant must understand both subject and current destination.
The capability is a configurable MinhaIncorporadora default. Deployment and backfill remain isolated per tenant.

## Functional Requirements

- Classify content, editorial nature, recommended uses, publication readiness and
  channel formats independently.
- Allow one asset to be recommended for both customers and social media.
- Accept optional destination, preparation and format in `minhaincorp_midia`.
- Infer explicit customer/social intent from natural language.
- Ask a short clarification only when a generic request is materially ambiguous.
- Rank matching intent first while allowing a controlled fallback.
- Preserve native delivery and calls without the new parameters.

## Acceptance Criteria

- [ ] Given an advertising card depicting a kitchen, when classified, then the
      kitchen remains in content metadata and the asset is an advertising creative.
- [ ] Given a drone video suitable for both uses, when classified, then customer and
      social use are both stored without conflict.
- [ ] Given “send a clean kitchen photo for my customer”, when searched, then clean
      customer-suitable assets rank ahead of social cards.
- [ ] Given “send a kitchen story to publish”, when searched, then ready story assets
      rank first.
- [ ] Given “send the drone video to show the view to my customer”, when searched,
      then prior social publication does not exclude that video.
- [ ] Given a materially ambiguous generic request, when handled, then the assistant
      asks a short customer-versus-social question.
- [ ] Given an existing call without destination metadata, when it runs, then current
      behavior remains compatible.
- [ ] Given a tenant backfill, when it runs, then no other tenant row, file, configuration or channel is changed.

## Out of Scope

- Automatic creative generation or editing.
- Direct publication to social networks.
- Campaign analytics, legal approval or image-rights management.

## Dependencies

- Decision dated 2026-07-05.
- Track B ingestion and delivery in EPIC-0003.
- Tenant-labeled benchmark datasets and additive migration.

## Notes

Detailed specification:
`hermes-minhaincorporadora/docs/SPEC-CLASSIFICACAO-E-BUSCA-DE-MIDIAS.md`.
