# Decision: Classify media content and intended use independently

## Status

Accepted — 2026-07-05

## Context

MinhaIncorporadora currently classifies media primarily by what it contains. This
loses an independent question: whether the asset is a clean visual, an advertising
creative, ready for social publication, or suitable for showing to a customer.
These dimensions are not mutually exclusive: a social card can contain a kitchen,
and a published drone video can still explain a customer's view.

## Decision

1. Preserve content metadata: category, environments, elements, tags and description.
2. Add editorial nature: clean content, advertising creative, hybrid, technical or
   undetermined.
3. Store recommended uses as multi-value metadata: customer, social publication,
   broker presentation, institutional and internal.
4. Store publication readiness separately from recommended use.
5. Store channel/format hints independently: feed, story, reel, vertical/horizontal
   video, drone, tour, WhatsApp and presentation.
6. Media search accepts optional destination, preparation and format intent. These
   influence ranking rather than creating exclusive categories.
7. Explicit intent comes from the broker's wording; a generic request asks a short
   clarification only when the distinction materially changes the result.
8. Ship as the configurable MinhaIncorporadora default. Roll out and backfill one tenant at a time; preserve old metadata and embeddings until each tenant is validated.

## Consequences

- `arquivos` receives additive editorial/use/readiness/format metadata and a
  classification version; existing category, tags and descriptions remain valid.
- Image and video prompts return structured content and editorial sections.
- `minhaincorp_midia` remains backward-compatible while accepting richer intent.
- Retrieval keeps strict tenant/project/modality boundaries, then ranks theme,
  destination, readiness and format.
- Existing tenant media requires a resumable backfill and low-confidence review.

## Related

- `epics/EPIC-0003-track-b-media-document-ingestion.md`
- `stories/STORY-0003-request-media-by-destination.md`
- `hermes-minhaincorporadora/docs/SPEC-CLASSIFICACAO-E-BUSCA-DE-MIDIAS.md`

## Related Repositories

- `hermes-minhaincorporadora` — schema, classifier, search, tool and benchmark.
- `TM-roadmap` — product decision and phased delivery plan.
- `hermes-infra` — product defaults with tenant-level overrides and isolated rollout.
