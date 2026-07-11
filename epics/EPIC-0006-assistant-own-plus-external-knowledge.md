# [EPIC] Assistant retrieval over own + complementary external base

## Status

Draft

## Product

MinhaIncorporadora

## Parent Initiative

INITIATIVE-0003 — ConcienciaTM, Truemobile shared knowledge service

## Problem

The assistant answers only from its own per-client knowledge. It cannot draw on
the shared global knowledge that Truemobile curates for all clients (sales
technique, credit rules, market/process knowledge), so every client would have to
re-teach the same general material.

## Objective

Let the assistant answer using both its own client knowledge base and a
complementary external (global) base, merged and ranked, while never exposing
another client's private knowledge.

## Scope

- Retrieve from the client's own knowledge base plus the complementary global
  base created by EPIC-0005.
- Merge and rank results across both sources (hybrid vector + full-text), with
  clear provenance (own vs global) on each hit.
- Scope-safety: a client sees only its own knowledge + global; never another
  client's.
- Graceful behavior when the global base is empty or unavailable.

## Out of Scope

- Authoring/ingesting knowledge — see EPIC-0005.
- The management UI — see EPIC-0007.

## User Flow

1. A broker asks a general or client-specific question.
2. The assistant retrieves candidates from the client base and the global base.
3. Results are merged/ranked; the answer is grounded in both, preferring the more
   specific client knowledge when they conflict.

## Target Repository

MinhaIncorporadora

## Dependencies

- EPIC-0005 (produces the global base).
- Global-base placement (resolved in INITIATIVE-0003): consult-only calls to
  the ConcienciaTM API at runtime — never replication into client DBs/RAGs.
  Answers and artifacts are used and discarded client-side.

## User Stories

- [ ] As a broker, I get answers that combine my incorporadora's knowledge with general knowledge.
- [ ] As Truemobile, knowledge I publish globally starts helping every client's assistant.
- [ ] As a client, my private knowledge is never exposed to another client.

## Technical Tasks

- [ ] Retrieval that queries own + global bases and fuses results.
- [ ] Provenance tagging (own vs global) in the retrieval payload.
- [ ] Conflict/precedence policy (specific client knowledge over global).
- [ ] Access path to the global base compatible with the atomic per-client model.

## Acceptance Criteria

- [ ] Answers can be grounded in both bases with visible provenance.
- [ ] No cross-client private knowledge is ever retrievable.
- [ ] Assistant degrades gracefully when the global base is empty/unavailable.
