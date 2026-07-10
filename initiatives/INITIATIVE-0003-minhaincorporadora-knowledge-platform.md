# Initiative: MinhaIncorporadora Knowledge Platform

## Status

Draft

## Product

MinhaIncorporadora

## Summary

Turn the assistant's knowledge from a by-product of content ingestion into a
first-class, managed platform with two scopes and two authoring roles:

* **Global knowledge** — shared across all incorporadoras (owned by Truemobile,
  the platform operator). Sales technique, objection handling, credit rules,
  general market/process knowledge.
* **Per-incorporadora knowledge** — private to a single client, authored by
  Truemobile or by that client's own IT.

Anyone authorized feeds information — text, a file, a video or a photo — and the
AI turns it into searchable knowledge. The author chooses whether to keep only
the extracted knowledge or also the artifact (e.g. a training video becomes
knowledge without the video ever being deliverable to brokers). The assistant
then answers from its own knowledge plus the complementary global base, and a
front-end lets both Truemobile and the client author and maintain all of it.

## Problem

Today knowledge exists only as a side effect of ingesting a client's marketing
content, is per-client only, and can only be authored by running pipelines. There
is no way for Truemobile to teach all clients at once, no way for a client's IT
to add its own knowledge, no notion of "learn from this but do not expose the
artifact", and the assistant cannot draw on shared cross-client knowledge.

## Objective

A managed knowledge platform where the right people can teach the assistant at
the right scope, from any modality, choosing artifact retention, and where the
assistant answers from both its own and a complementary global base.

## Target Users

- Truemobile operators (platform owner) — author global or any client's knowledge.
- Client IT / content owners — author their own client's knowledge.
- Brokers — benefit indirectly through better assistant answers.

## Scope

- Multi-scope knowledge (global + per-client) with role-based authoring.
- Multi-modal ingestion (text/file/video/photo) with AI extraction.
- Per-input retention choice: knowledge-only vs knowledge + artifact.
- Assistant retrieval across own + complementary global base, scope-safe.
- Front-end for Truemobile and clients to author and maintain both.

## Out of Scope

- Cross-client data leakage: a client never sees another client's private
  knowledge; only global + its own.
- Changes to the Hermes Agent core.

## Success Criteria

- Truemobile can publish a piece of knowledge to all clients or to one, from any
  modality, with an artifact-retention choice.
- A client's IT can add knowledge only to its own base.
- The assistant answers using its own knowledge and the complementary global
  base, provably without exposing another client's private knowledge.
- Both roles manage everything through a front-end.

## Related Epics

- [ ] EPIC-0005 — Knowledge ingestion service (multi-scope, multi-role, multi-modal, retention choice)
- [ ] EPIC-0006 — Assistant retrieval over own + complementary external base
- [ ] EPIC-0007 — Knowledge management front-end (Truemobile + client)

## Dependencies

- INITIATIVE-0002 (atomic per-client platform): per-client knowledge already
  lives in each client's database; the global base needs a home compatible with
  the DB-per-client model.
- The nightly ingestion pipeline (discover/classify/chunk/embeddings) is reusable
  as the extraction engine.

## Risks

- Global-base placement in a DB-per-client world (shared read-only DB vs.
  publish/replicate into each client DB) — an architecture decision.
- Scope-safety of retrieval (must never mix clients' private knowledge).

## Open Questions

- Where does global knowledge live: a shared read-only knowledge database queried
  by every client stack, or replicated into each client database on publish?
- Is the knowledge front-end the same surface as the configuration/credentials
  front-end noted in INITIATIVE-0002, or a separate module?

## Target Repositories

- MinhaIncorporadora (ingestion, retrieval, storage)
- A new front-end surface (to be defined)
